import { z } from "zod";
import { writeFile } from "node:fs/promises";

import * as B from "@baton-pass/gql-canvas";
import { bigModelQuery as query } from "@baton-pass/gql-canvas";

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

type Determine<
  T extends Record<string, unknown>,
  K extends keyof T,
  D extends Pick<T, K>,
> = Extract<T, D>;

function convert(a: ConvertIn): Schema {
  // const emptyToDo = (notes = "No reason given") => ({
  //   data: S.assertNonEmpty([
  //     {
  //       type: "to-do",
  //       operation: "create",
  //       attributes: { title: "Empty To-Do", notes },
  //     },
  //   ]),
  // });

  type ProjectSchema = Schema["data"][number];

  // Canvas Enrollment/Course -> Things Project

  return {
    data: S.assertNonEmpty({
      arr: a.flatMap<ProjectSchema>(({ id: enrollId, course }) => {
        if (!course) {
          throw new Error("Enrollment should provide an associated course!");
        }

        const { id: courseId, name: n, modulesConnection } = course;

        const title =
          typeof n === "string"
            ? n
            : `${n.subject} ${n.class}-${n.section}: ${n.title}`;

        const notes = `- Enrollment id: ${enrollId}
        - Course id: ${courseId}`;

        // Canvas Module -> Things Header

        if (!modulesConnection) {
          throw new Error("Course should have module connection array!");
        }

        const mods = modulesConnection.modules;

        if (!mods || mods.length === 0) {
          return {
            type: "project",
            operation: "create",
            attributes: {
              title,
              notes,
            },
          };
        }

        type ModSchema = NonNullable<
          Determine<
            ProjectSchema,
            "type" | "operation",
            { type: "project"; operation: "create" }
          >["attributes"]["items"]
        >[number];

        return {
          type: "project",
          operation: "create",
          attributes: {
            title,
            notes,
            items: S.assertNonEmpty({
              message: "There should be at least one module item!",
              arr: mods.flatMap<ModSchema>((mod) => {
                if (!mod) {
                  throw new Error("Course should contain a module array!");
                }

                const { name: modName, items } = mod;

                // Turning module into heading and module items into subsequent to-dos

                const modHeading: ModSchema = {
                  type: "heading",
                  attributes: { title: modName ?? "Unknown Heading" },
                };

                // Canvas Module Item -> Things To-Do

                if (!items || items.length === 0) {
                  return [
                    modHeading,
                    {
                      type: "to-do",
                      operation: "create",
                      attributes: { title: modName ?? "Unknown Heading" },
                    },
                  ];
                }

                const modItems = items.map<ModSchema>(
                  ({ name: modItemName, content }) => {
                    if (!content) {
                      throw new Error("Module item should have content!");
                    }

                    // Switching based upon module item content type to customize to-do

                    switch (content.type) {
                      case "Assignment": {
                        const title = `${content.type}: ${
                          modItemName ?? content.name ?? "No name"
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "Discussion": {
                        const title = `${content.type}: ${
                          modItemName ?? content.title ?? "No title"
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "ExternalTool": {
                        const title = `${content.type}: ${
                          modItemName ?? content.name ?? "No name"
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "ExternalUrl": {
                        const title = `${content.type}: ${
                          modItemName ?? content.title ?? "No title"
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "File": {
                        const title = `${content.type}: ${
                          modItemName ?? content.id
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "ModuleExternalTool": {
                        const title = `${content.type}: ${
                          modItemName ?? content.id
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "Page": {
                        const title = `${content.type}: ${
                          modItemName ?? content.title ?? "No title"
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "Quiz": {
                        const title = `${content.type}: ${
                          modItemName ?? content.id
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }

                      case "SubHeader": {
                        const title = `${content.type}: ${
                          modItemName ?? content.title ?? "No title"
                        }`;

                        return {
                          type: "to-do",
                          operation: "create",
                          attributes: { title },
                        };
                      }
                    }
                  },
                );

                return [modHeading, ...modItems];
              }),
            }),
          },
        };
      }),
    }),
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
