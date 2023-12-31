import { GraphQLClient, Variables } from "graphql-request";
import { z } from "zod";

export class GraphQLRequestNoParams<T> {
  constructor(
    readonly body: () => { q: string },
    readonly parser: (res: unknown) => T,
  ) {}
}

export class GraphQLRequestWithParams<T, V> {
  constructor(
    readonly body: (variables: V) => { q: string; variables: V },
    readonly parser: (res: unknown) => T,
  ) {}
}

export type GraphQLRequest<T = unknown, V = unknown> =
  | GraphQLRequestNoParams<T>
  | GraphQLRequestWithParams<T, V>;

export interface GraphQLSchemaNoParams {
  params: false;
  body: () => { q: string };
  schema: z.Schema;
}

export interface GraphQLSchemaWithParams<V = unknown> {
  params: true;
  body: (variables: V) => { q: string; variables: V };
  schema: z.Schema;
}

export type GraphQLSchema<T = unknown> =
  | GraphQLSchemaNoParams
  | GraphQLSchemaWithParams<T>;

// DONE Investigate both functions below, potential bugs in types

// Zod to req converter

export function schemaToRequest<S extends GraphQLSchemaNoParams>(
  gqlSchema: S,
): GraphQLRequestNoParams<z.output<S["schema"]>>;
// rome-ignore lint/suspicious/noExplicitAny: in generic
export function schemaToRequest<S extends GraphQLSchemaWithParams<any>>(
  gqlSchema: S,
): GraphQLRequestWithParams<z.output<S["schema"]>, Parameters<S["body"]>[0]>;

export function schemaToRequest(
  gqlSchema: GraphQLSchemaNoParams | GraphQLSchemaWithParams,
) {
  if (!gqlSchema.params) {
    return new GraphQLRequestNoParams(gqlSchema.body, (res) =>
      gqlSchema.schema.parse(res),
    );
  }

  return new GraphQLRequestWithParams(gqlSchema.body, (res) =>
    gqlSchema.schema.parse(res),
  );
}

// Zod to safe req converter

type SafeOutput<T extends z.Schema> = z.SafeParseReturnType<
  z.input<T>,
  z.output<T>
>;

export function schemaToSafeRequest<S extends GraphQLSchemaNoParams>(
  gqlSchema: S,
): GraphQLRequestNoParams<SafeOutput<S["schema"]>>;
// rome-ignore lint/suspicious/noExplicitAny: in generic
export function schemaToSafeRequest<S extends GraphQLSchemaWithParams<any>>(
  gqlSchema: S,
): GraphQLRequestWithParams<SafeOutput<S["schema"]>, Parameters<S["body"]>[0]>;

export function schemaToSafeRequest(
  gqlSchema: GraphQLSchemaNoParams | GraphQLSchemaWithParams,
) {
  if (!gqlSchema.params) {
    return new GraphQLRequestNoParams(gqlSchema.body, (res) =>
      gqlSchema.schema.safeParse(res),
    );
  }

  return new GraphQLRequestWithParams(gqlSchema.body, (res) =>
    gqlSchema.schema.safeParse(res),
  );
}

// Query executor

export interface QueryGQL<P extends Variables, R> {
  endpoint: string;
  token?: string;
  query: GraphQLRequest<R, P>;
}

export function queryGraphQL<P extends Variables, R>(params: QueryGQL<P, R>) {
  const client = new GraphQLClient(params.endpoint).setHeader(
    "authorization",
    `Bearer ${params.token ?? "NO_TOKEN"}`,
  );

  const req = params.query;

  if (req instanceof GraphQLRequestNoParams) {
    return {
      async fire() {
        const reqBody = req.body();

        return req.parser(await client.request(reqBody.q));
      },
    } as { fire: () => Promise<R> };
  }

  return {
    async fire(queryParams: P) {
      const { q, variables } = req.body(queryParams);

      return req.parser(await client.request<unknown, Variables>(q, variables));
    },
  } as { fire: (queryParams: P) => Promise<R> };
}
