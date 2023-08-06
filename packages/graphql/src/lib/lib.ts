import { GraphQLClient } from "graphql-request";
import { z } from "zod";

export interface GraphQLRequestNoParams<T> {
  body: () => { q: string };
  parser: (res: unknown) => T;
}

export interface GraphQLRequestWithParams<T, V> {
  body: (variables: V) => { q: string; variables: V };
  parser: (res: unknown) => T;
}

export type GraphQLRequest<T = unknown, V = unknown> =
  | GraphQLRequestNoParams<T>
  | GraphQLRequestWithParams<T, V>;

export interface GraphQLSchemaNoParams {
  body: () => { q: string };
  schema: z.Schema;
}

export interface GraphQLSchemaWithParams<T = unknown> {
  body: (variables: T) => { q: string; variables: T };
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
  const { body, schema } = gqlSchema;

  return { body, parser: (u: unknown) => schema.parse(u) };
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
  const { body, schema } = gqlSchema;

  return { body, parser: (u: unknown) => schema.safeParse(u) };
}

// Query executor

type GQLVars = Record<string, unknown>;

export interface QueryGQL<P extends GQLVars, R> {
  endpoint: string;
  token?: string;
  query: GraphQLRequest<R, P>;
}

export function queryGraphQL<P extends GQLVars, R>(params: QueryGQL<P, R>) {
  const client = new GraphQLClient(params.endpoint).setHeader(
    "authorization",
    `Bearer ${params.token ?? "NO_TOKEN"}`,
  );

  return {
    async fire(queryParams: P) {
      const req = params.query.body(queryParams);

      return params.query.parser(
        await client.request(
          req.q,
          "variables" in req ? (req.variables as P) : undefined,
        ),
      );
    },
  };
}
