import { gql } from "graphql-request";
import { z } from "zod";

import * as F from "./fragments";
import { schemaToRequest, schemaToSafeRequest } from "./lib";

/**
 * A pre-fabricated query for creating a Model.
 */
export const bigModelQuery = schemaToRequest({
  body: (variables: { id: number }) => {
    const courseBody = F.course.body();
    const moduleBody = F.module.body();
    const moduleItemBody = F.moduleItem.body();
    const subHeaderBody = F.subHeader.body();
    const pageBody = F.page.body();
    const assignmentBody = F.assignment.body();
    const fileBody = F.file.body();
    const extUrlBody = F.extUrl.body();
    const moduleExtToolBody = F.moduleExtTool.body();
    const extToolBody = F.extTool.body();
    const discussionBody = F.discussion.body();
    const quizBody = F.quiz.body();

    return {
      q: gql`
        ${courseBody.q}
        ${moduleBody.q}
        ${moduleItemBody.q}
        ${subHeaderBody.q}
        ${pageBody.q}
        ${assignmentBody.q}
        ${fileBody.q}
        ${extUrlBody.q}
        ${moduleExtToolBody.q}
        ${extToolBody.q}
        ${discussionBody.q}
        ${quizBody.q}

        query ModelQuery($id: ID!) {
          Model: legacyNode(_id: $id, type: User) {
            ... on User {
              enrollments {
                id: _id
                course {
                  ...CourseFragment
                  modulesConnection {
                    modules: nodes {
                      ...ModuleFragment
                      items: moduleItems {
                        ...ModuleItemFragment
                        content {
                          ...SubHeaderFragment
                          ...PageFragment
                          ...AssignmentFragment
                          ...FileFragment
                          ...ExtUrlFragment
                          ...ModuleExtToolFragment
                          ...ExtToolFragment
                          ...DiscussionFragment
                          ...QuizFragment
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables,
    };
  },
  schema: z
    .object({
      Model: z.object({
        enrollments: z
          .object({
            id: z.coerce.number(),
            course: F.course.schema
              .extend({
                modulesConnection: z
                  .object({
                    modules: F.module.schema
                      .extend({
                        items: F.module.schema
                          .extend({
                            content: z
                              .union([
                                F.subHeader.schema,
                                F.page.schema,
                                F.assignment.schema,
                                F.file.schema,
                                F.extUrl.schema,
                                F.moduleExtTool.schema,
                                F.extTool.schema,
                                F.discussion.schema,
                                F.quiz.schema,
                              ])
                              .nullable(),
                          })
                          .array()
                          .nullable(),
                      })
                      .nullable()
                      .array()
                      .nullable(),
                  })
                  .nullable(),
              })
              .nullable(),
          })
          .array(),
      }),
    })
    .transform(({ Model }) => Model.enrollments),
});

export const smallModelQuery = schemaToRequest({
  body: (variables: { id: number }) => ({
    q: gql`
      query SmallModelQuery($id: ID!) {
        Model: legacyNode(_id: $id, type: User) {
          ... on User {
            enrollments {
              id: _id
              course {
                id: _id
                name
                courseCode
                courseNickname
                term {
                  id: _id
                  name
                }
              }
            }
          }
        }
      }
    `,
    variables,
  }),
  schema: z
    .object({
      Model: z.object({
        enrollments: z
          .object({
            id: z.coerce.number(),
            course: z.object({
              id: z.coerce.number(),
              name: z.string(),
              courseCode: z.string().nullable(),
              courseNickname: z.string().nullable(),
              term: z.object({
                id: z.coerce.number(),
                name: z.string().nullable(),
              }),
            }),
          })
          .array(),
      }),
    })
    .transform(({ Model }) => Model.enrollments),
});

export const quickAndDirtyQuery = schemaToSafeRequest({
  body: (variables: { id: number }) => {
    const courseBody = F.course.body();

    return {
      q: gql`
        ${courseBody.q}

        query QuickAndDirtyQuery($id: ID!) {
          Model: legacyNode(_id: $id, type: User) {
            ... on User {
              enrollments {
                id: _id
                course {
                  ...CourseFragment
                }
              }
            }
          }
        }
      `,
      variables,
    };
  },
  schema: z
    .object({
      Model: z.object({
        enrollments: z
          .object({
            id: z.coerce.number(),
            course: F.course.schema,
          })
          .array(),
      }),
    })
    .transform(({ Model }) => Model.enrollments),
});
