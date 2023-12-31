import { z } from "zod";

import {
  noVariableQuery as query,
  queryGraphQL,
} from "@baton-pass/gql-canvas";

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

  console.log(res.data);

  return 0;
}
