import { gql } from "graphql-request";
import { z } from "zod";

import * as F from "./fragments";
import * as G from "./lib";

export type QueryReturn<T extends G.AnyGraphQLRequest> =
  // rome-ignore lint/suspicious/noExplicitAny: used in generic
  T extends G.GraphQLRequestWithParams<infer R, any>
    ? R
    : T extends G.GraphQLRequestNoParams<infer R>
    ? R
    : never;

/**
 * A pre-fabricated query for creating a Model.
 */
export const bigModelQuery = G.schemaToSafeRequest({
  params: true,
  body: (variables: { id: number }) => {
    return {
      q: gql`
        fragment RubricFragment on Rubric {
          id: _id
          title
          pointsPossible
          criteria {
            id: _id
            description
            longDescription
            points
          }
        }
        fragment SubmissionFragment on Submission {
          id: _id
          gradingStatus
          submittedAt
          grade
          score
          enteredGrade
          enteredScore
          late
          missing
          isCurrent: gradeMatchesCurrentSubmission
          latePolicyStatus
          attachment {
            ...FileFragment
          }
        }
        fragment CourseFragment on Course {
          id: _id
          name
          courseCode
        }
        fragment ModuleFragment on Module {
          id: _id
          name
          position
        }
        fragment ModuleItemFragment on ModuleItem {
          id: _id
          url
        }
        fragment SubHeaderFragment on SubHeader {
          type: __typename
          title
        }
        fragment PageFragment on Page {
          type: __typename
          id: _id
          title
          createdAt
          updatedAt
        }
        fragment AssignmentFragment on Assignment {
          type: __typename
          id: _id
          name
          description
          url: htmlUrl
          pointsPossible
          rubric {
            ...RubricFragment
          }
          createdAt
          dueAt
          lockAt
          updatedAt
          state
          allowedAttempts
          submissions: submissionsConnection {
            grades: nodes {
              ...SubmissionFragment
            }
          }
        }
        fragment FileFragment on File {
          type: __typename
          id: _id
          contentType
          url
        }
        fragment ExtUrlFragment on ExternalUrl {
          type: __typename
          id: _id
          title
          extUrl: url
        }
        fragment ModuleExtToolFragment on ModuleExternalTool {
          type: __typename
          id: _id
          modUrl: url
        }
        fragment ExtToolFragment on ExternalTool {
          type: __typename
          id: _id
          name
          description
          url
        }
        fragment DiscussionFragment on Discussion {
          type: __typename
          id: _id
          title
          entries: discussionEntriesConnection {
            posts: nodes {
              id: _id
              author {
                id: _id
                name
                shortName
                pronouns
              }
              message
              attachment {
                ...FileFragment
              }
              subentriesCount
              createdAt
              updatedAt
            }
          }
        }
        fragment QuizFragment on Quiz {
          type: __typename
          id: _id
          createdAt
          updatedAt
        }

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
                              .discriminatedUnion("type", [
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
                              .nullish(),
                          })
                          .array()
                          .nullish(),
                      })
                      .nullish()
                      .array()
                      .nullish(),
                  })
                  .nullish(),
              })
              .nullish(),
          })
          .array(),
      }),
    })
    .transform(({ Model }) => Model.enrollments),
});

export const smallModelQuery = G.schemaToRequest({
  params: true,
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
              courseCode: z.string().nullish(),
              courseNickname: z.string().nullish(),
              term: z.object({
                id: z.coerce.number(),
                name: z.string().nullish(),
              }),
            }),
          })
          .array(),
      }),
    })
    .transform(({ Model }) => Model.enrollments),
});

export const quickAndDirtyQuery = G.schemaToSafeRequest({
  params: true,
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

export const noVariableQuery = G.schemaToSafeRequest({
  params: false,
  body: () => ({
    q: gql`
      ${F.course.body().q}

      query NoVariableQuery {
        allCourses {
          ...CourseFragment
        }
      }
    `,
  }),
  schema: z.object({
    allCourses: F.course.schema.array().nullish(),
  }),
});
