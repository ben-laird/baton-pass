import { z } from "zod";

import {
  noVariableQuery as query,
  queryGraphQL,
  type QueryReturn,
} from "@baton-pass/gql-canvas";
import { thingsJsonSchema, ThingsJsonSchema } from "./lib";

const env = {
  ...z
    .object({
      CANVAS_AUTH_TOKEN: z.string(),
      USER_ID: z.coerce.number(),
      ENDPOINT: z
        .string()
        .url()
        .default("https://canvas.liberty.edu/api/graphql"),
    })
    .parse(process.env),
} as const;

type SafeSuccessInfer<T extends z.SafeParseReturnType<unknown, unknown>,> =
  T extends z.SafeParseSuccess<infer I> ? I : never;

type ConvertIn = SafeSuccessInfer<QueryReturn<typeof query>>;

function assertNonEmpty<T>(array: Array<T>) {
  if (array.length < 1) {
    throw new Error("array must be nonempty!");
  }

  return array as [T, ...T[]];
}

function convert({ allCourses }: ConvertIn): ThingsJsonSchema {
  const empty = (notes = "No reason given"): ThingsJsonSchema => ({
    data: [
      {
        type: "to-do",
        operation: "create",
        attributes: { title: "Empty To-Do", notes },
      },
    ],
  });

  if (!allCourses) {
    return empty();
  }

  return {
    data: assertNonEmpty(
      allCourses.map(({ id, name }) => {
        const title =
          typeof name === "string"
            ? name
            : `${name.subject} ${name.class}-${name.section}: ${name.title}`;

        return {
          type: "project",
          operation: "create",
          attributes: { title, notes: `id: ${id}` },
        };
      }),
    ),
  };
}

/**
 * The main script. When this package is `install`ed,
 * this is the function that will run when you call `npx <<package name>>` or similar.
 * @returns an integer representing the exit code of the program
 */
export async function main(): Promise<number> {
  const { fire } = queryGraphQL({
    token: env.CANVAS_AUTH_TOKEN,
    endpoint: env.ENDPOINT,
    query,
  });

  const res = await fire({ id: env.USER_ID });

  if (!res.success) {
    console.error(res.error.issues);
    return 1;
  }

  const courses = res.data.allCourses;

  if (!courses || courses.length === 0) {
    console.error("Response should contain a nonempty array of data!");
    console.error(res.data);
    return 1;
  }

  const url = thingsJsonSchema.parse(convert({ allCourses: courses }));

  console.log(url.href);

  return 0;
}
