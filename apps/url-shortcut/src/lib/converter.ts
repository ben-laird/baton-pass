import { z } from "zod";
import { format } from "date-fns";

import {
  type QueryReturn,
  bigModelQuery as query,
} from "@baton-pass/gql-canvas";
export { query };

import * as S from "./lib";
import { thingsJsonSchema as schema } from "./lib";
export { schema };

type ConvertIn = S.SuccessInfer<QueryReturn<typeof query>>;

type Schema = z.input<typeof schema>;

type Determine<
  T extends Record<string, unknown>,
  K extends keyof T,
  D extends Pick<T, K>,
> = Extract<T, D>;

// Conversion function - where the magic happens

export function convert(a: ConvertIn): Schema {
  type ProjectSchema = Schema["data"][number];

  // Canvas Enrollment/Course -> Things Project

  return {
    data: S.assertNonEmpty({
      array: a.flatMap<ProjectSchema>(
        ({ id: enrollId, state, htmlUrl, course }) => {
          const {
            id: courseId,
            name: n,
            modulesConnection,
            syllabusBody,
          } = S.guarantee({
            value: course,
            message: "Enrollment should have an associated course!",
          });

          const details = {
            title:
              typeof n === "string"
                ? n
                : `${n.subject} ${n.class}-${n.section}: ${n.title}`,

            notes: `- Enrollment id: ${enrollId}\n\
            - Course id: ${courseId}\n\
            - Enrollment url: ${htmlUrl}\n\
            \n\
            ## Syllabus \n\
            \n\
            ${syllabusBody}`,
          };

          const { modules } = S.guarantee({
            value: modulesConnection,
            message: "Course should have existent module connection array!",
          });

          if (!modules || modules.length === 0) {
            return {
              type: "project",
              operation: "create",
              attributes: {
                ...details,
                when:
                  state === "creation_pending"
                    ? {
                        style: "special",
                        data: "someday",
                      }
                    : undefined,
                canceled: state === "inactive",
                completed: state === "completed",
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

          // Canvas Module -> Things Header

          return {
            type: "project",
            operation: "create",
            attributes: {
              ...details,
              items: S.assertNonEmpty({
                message: "There should be at least one module item!",
                array: modules.flatMap<ModSchema>((mod) => {
                  const { name: modName, items } = S.guarantee({
                    value: mod,
                    message: "Module item should exist!",
                  });

                  // Turning module into heading and module items into subsequent to-dos

                  const modHeading: ModSchema = {
                    type: "heading",
                    attributes: { title: modName ?? "Unknown Heading" },
                  };

                  if (!items || items.length === 0) {
                    return modHeading;
                  }

                  // Canvas Module Item -> Things To-Do

                  const modItems = items.map<ModSchema>(
                    ({ name: modItemName, content: value }) => {
                      const content = S.guarantee({
                        value,
                        message: "Module item should have content!",
                      });

                      // Switching based upon module item content type to customize to-do

                      function expr<T>(lam: () => T): T {
                        return lam();
                      }

                      switch (content.type) {
                        case "Assignment": {
                          const {
                            description,
                            name,
                            pointsPossible,
                            createdAt,
                            dueAt,
                            updatedAt,
                            rubric: nullishRubric,
                            url,
                          } = content;

                          const rubric = expr(() => {
                            if (!nullishRubric) {
                              return "No rubric provided";
                            }

                            const { title, pointsPossible, criteria } =
                              nullishRubric;

                            const formattedCriteria = criteria
                              .map(({ longDescription, points }) => {
                                return `${
                                  points ?? "Unknown number of"
                                } point(s) - ${
                                  longDescription ?? "No description provided"
                                }`;
                              })
                              .join("\n");

                            return `${title ?? "Unknown title"}\n\
                            \n\
                            - Points possible: ${pointsPossible ?? "unknown"}\n\
                            \n\
                            ${formattedCriteria}`;
                          });

                          const title = modItemName ?? name ?? "No name";

                          const notes = `## Info\n\
                          \n\
                          ${description}\n\
                          \n\
                          - Type: Assignment\n\
                          - Points possible: ${pointsPossible ?? "unknown"}\n\
                          - Url: ${url ?? "none"}\n\
                          - Created at: ${createdAt}\n\
                          - Last updated ${format(
                            updatedAt ?? new Date(),
                            "MMMM do, y at h aaa",
                          )}\n\
                          \n\
                          ## Rubric\n\
                          \n\
                          ${rubric}`;

                          return {
                            type: "to-do",
                            operation: "create",
                            attributes: {
                              title,
                              notes,
                              deadline: dueAt ?? undefined,
                            },
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
        },
      ),
    }),
  };
}
