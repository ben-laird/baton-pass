import { writeFile } from "node:fs/promises";
import { z } from "zod";

import { Baton } from "@baton-pass/gql-canvas";

import { convert, query, schema } from "./converter";
// import { getInitialData, guarantee } from "./lib";

const env = {
  ...z
    .object({
      CANVAS_AUTH_TOKEN: z.string(),
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
  // const { terms } = await getInitialData({ token: env.CANVAS_AUTH_TOKEN });

  const { fire } = Baton.queryGraphQL({
    token: env.CANVAS_AUTH_TOKEN,
    endpoint: env.ENDPOINT,
    query,
  });

  const res = await fire({ courseId: 497698 }); // CSCN 112 course code

  if (!res.success) {
    console.error("Fire unsuccessful!\n");
    console.error(res.error.issues);
    return 1;
  }

  const url = schema.parse(convert(res.data));

  const filePath = "./url.txt";

  await writeFile(filePath, url.href);

  console.log(`File ${filePath} created!`);

  return 0;
}
