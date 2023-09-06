import { z } from "zod";
import { format } from "date-fns";

import { type QueryReturn, finalQuery as query } from "@baton-pass/gql-canvas";
export { query };

import * as Lib from "./lib";
import { thingsJsonSchema as schema } from "./lib";
export { schema };

type ConvertIn = Lib.SuccessInfer<QueryReturn<typeof query>>;

type Schema = z.input<typeof schema>;

// Conversion function - where the magic happens

export function convert(a: ConvertIn): Schema {
  type ProjectSchema = Schema["data"][number];

  // Canvas Course -> Things Project

  return {
    data: Lib.assertNonEmpty({
      array: Lib.guarantee({
        value: a.Model?.enrollments,
      }).flatMap<ProjectSchema>(({ course }) => {
        const {
          id: courseId,
          name: n,
          modulesConnection,
          syllabusBody,
        } = Lib.guarantee({
          value: course,
          message: "Enrollment should have an associated course!",
        });

        const details = {
          title:
            typeof n === "string"
              ? n
              : `${n.subject} ${n.class}-${n.section}: ${n.title}`,

          notes: compose([
            "## Info",
            null,
            `- Course id: ${courseId}`,
            null,
            "## Syllabus",
            null,
            syllabusBody ?? "No syllabus provided",
          ]),
        };

        const { modules } = Lib.guarantee({
          value: modulesConnection,
          message: "Course should have existent module connection array!",
        });

        if (!modules || modules.length === 0) {
          return {
            type: "project",
            operation: "create",
            attributes: {
              ...details,
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
            items: Lib.assertNonEmpty({
              message: "There should be at least one module item!",
              array: modules.flatMap<ModSchema>((mod) => {
                const { name: modName, items } = Lib.guarantee({
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

                const modItems = items.flatMap<ModSchema>(
                  ({ content: value }) => {
                    const content = Lib.guarantee({
                      value,
                      message: "Module item should have content!",
                    });

                    interface ModuleItemAttributes {
                      title: string;
                      notes?: string;
                      deadline?: Date;
                      completed?: boolean;
                    }

                    const attributes = moduleItemConvert();

                    return attributes
                      ? { type: "to-do", operation: "create", attributes }
                      : [];

                    function moduleItemConvert(): ModuleItemAttributes | null {
                      // Switching based upon module item content type to customize to-do

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
                            submissions,
                          } = content;

                          const rubric = expr(() => {
                            if (!nullishRubric) {
                              return "No rubric provided";
                            }

                            const { title, pointsPossible, criteria } =
                              nullishRubric;

                            const formattedCriteria = compose(
                              criteria.map(({ longDescription, points }) => {
                                return `${
                                  points ?? "Unknown number of"
                                } point(s) - ${
                                  longDescription ?? "No description provided"
                                }`;
                              }),
                            );

                            return compose([
                              `${title ?? "Unknown title"}`,
                              null,
                              `- Points possible: ${
                                pointsPossible ?? "unknown"
                              }`,
                              null,
                              formattedCriteria,
                            ]);
                          });

                          return {
                            title: name ?? "No name",
                            notes: compose([
                              "## Info",
                              null,
                              description ?? "No description provided",
                              null,
                              "- Type: Assignment",
                              `- Points possible: ${
                                pointsPossible ?? "unknown"
                              }`,
                              `- Url: ${url ?? "none"}`,
                              `- Created at: ${naturalFormatDate(createdAt)}`,
                              `- Last updated ${naturalFormatDate(updatedAt)}`,
                              null,
                              "## Rubric",
                              null,
                              rubric,
                            ]),
                            deadline: dueAt ?? undefined,
                            completed: submissions.length > 0,
                          };
                        }

                        case "ExternalTool": {
                          const { description, name, url } = content;

                          return {
                            title: name ?? "No name",
                            notes: compose([
                              "## Info",
                              null,
                              description ?? "No description provided",
                              null,
                              "- Type: External Tool",
                              `- Url: ${url ?? "None provided"}`,
                            ]),
                          };
                        }

                        case "ExternalUrl": {
                          const { extUrl } = content;

                          return {
                            title: content.title ?? "No title",
                            notes: compose([
                              "## Info",
                              null,
                              "- Type: External Url",
                              `- Url: ${extUrl ?? "None provided"}`,
                            ]),
                          };
                        }

                        case "File": {
                          const { contentType, url } = content;

                          return {
                            title: `File #${content.id}`,
                            notes: compose([
                              "## Info",
                              null,
                              "- Type: File",
                              `- Content type: ${contentType ?? "Unknown"}`,
                              `- Url: ${url ?? "None provided"}`,
                            ]),
                          };
                        }

                        case "ModuleExternalTool": {
                          const { modUrl } = content;

                          return {
                            title: `Module External Tool #${content.id}`,
                            notes: compose([
                              "## Info",
                              null,
                              "- Type: Module External Tool",
                              `- Url: ${modUrl ?? "None provided"}`,
                            ]),
                          };
                        }

                        case "Page": {
                          const { createdAt, updatedAt } = content;

                          return {
                            title: content.title ?? "No title",
                            notes: compose([
                              "## Info",
                              null,
                              "- Type: Page",
                              `- Created at: ${naturalFormatDate(createdAt)}`,
                              `- Last updated ${naturalFormatDate(updatedAt)}`,
                            ]),
                          };
                        }

                        case "SubHeader": {
                          return {
                            title: content.title ?? "No title",
                          };
                        }

                        case "Discussion":
                          return null;
                        case "Quiz":
                          return null;
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

// Utility types/functions

type Determine<
  T extends Record<string, unknown>,
  K extends keyof T,
  D extends Pick<T, K>,
> = Extract<T, D>;

function expr<T>(lam: () => T): T {
  return lam();
}

function compose(lines: (string | null)[]) {
  return lines.map((line) => line ?? "").join("\n");
}

type Nullish<T> = T | null | undefined;

function naturalFormatDate(date: Nullish<Date>) {
  if (!date) return "Unknown";

  return format(date, "MMMM do, y at h aaa");
}
