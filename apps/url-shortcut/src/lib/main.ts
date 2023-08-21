import { z } from "zod";

import * as B from "@baton-pass/gql-canvas";
import { noVariableQuery as query } from "@baton-pass/gql-canvas";

import * as S from "./lib";
import { thingsJsonSchema as schema } from "./lib";

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

// Conversion types

type ConvertIn = S.SuccessInfer<B.QueryReturn<typeof query>>;

type Schema = z.input<typeof schema>;

// Conversion function - where the magic happens

function convert({ allCourses }: ConvertIn): Schema {
  const empty = (notes = "No reason given"): Schema => ({
    data: [
      {
        type: "to-do",
        operation: "create",
        attributes: { title: "Empty To-Do", notes },
      },
    ],
  });

  if (!allCourses) return empty("No courses!");

  return {
    data: S.assertNonEmpty(
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
  const { fire } = B.queryGraphQL({
    token: env.CANVAS_AUTH_TOKEN,
    endpoint: env.ENDPOINT,
    query,
  });

  const res = await fire();

  if (!res.success) {
    console.error(res.error.issues);
    return 1;
  }

  const { allCourses } = res.data;

  if (!allCourses || allCourses.length === 0) {
    console.error("Response should contain a nonempty array of data!");
    console.error(res.data);
    return 1;
  }

  const url = schema.parse(convert({ allCourses }));

  console.log(url.href);

  return 0;
}
