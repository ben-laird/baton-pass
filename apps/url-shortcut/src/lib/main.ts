import { z } from "zod";
import { writeFile } from "node:fs/promises";

import * as B from "@baton-pass/gql-canvas";

import { convert, query, schema } from "./converter";

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
  const { fire } = B.queryGraphQL({
    token: env.CANVAS_AUTH_TOKEN,
    endpoint: env.ENDPOINT,
    query,
  });

  const res = await fire({ id: env.USER_ID });

  if (!res.success) {
    console.error("Fire unsuccessful!\n");
    console.error(res.error.issues);
    return 1;
  }

  const url = schema.parse(convert(res.data));

  await writeFile("./url.txt", url.href);

  return 0;
}
