import { gql } from "graphql-request";
import { z } from "zod";

import * as Fragment from "./fragments";
import * as Graph from "./lib";

export type QueryReturn<T extends Graph.AnyGraphQLRequest> =
  // rome-ignore lint/suspicious/noExplicitAny: used in generic
  T extends Graph.GraphQLRequestWithParams<infer R, any>
    ? R
    : T extends Graph.GraphQLRequestNoParams<infer R>
    ? R
    : never;

export const finalQuery = Graph.schemaToSafeRequest({
  params: true,
  body: (variables: {
    userId: number;
    current?: boolean;
    courseId?: number;
  }) => ({
    variables: { current: true, ...variables },
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
        term {
          ...TermFragment
        }
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
        discussion {
          ...DiscussionFragment
        }
        quiz {
          ...QuizFragment
        }
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
      }

      fragment QuizFragment on Quiz {
        type: __typename
        id: _id
        createdAt
        updatedAt
      }

      fragment TermFragment on Term {
        _id
        name
        startAt
        endAt
      }

      fragment EnrollmentFragment on Enrollment {
        id: _id
        state
        htmlUrl
      }

      query ModelQuery($userId: ID!, $current: Boolean!, $courseId: ID) {
        Model: legacyNode(_id: $userId, type: User) {
          ... on User {
            enrollments(currentOnly: $current, courseId: $courseId) {
              ...EnrollmentFragment
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
  }),
  schema: z.object({
    Model: z
      .object({
        enrollments: Fragment.enrollment.schema
          .extend({
            course: Fragment.course.schema
              .extend({
                modulesConnection: z.object({
                  modules: Fragment.module.schema
                    .extend({
                      items: Fragment.moduleItem.schema
                        .extend({
                          content: z
                            .discriminatedUnion("type", [
                              Fragment.subHeader.schema,
                              Fragment.page.schema,
                              Fragment.assignment.schema.extend({
                                discussion: Fragment.discussion.schema
                                  .omit({
                                    entries: true,
                                  })
                                  .nullish(),
                                quiz: Fragment.quiz.schema.nullish(),
                              }),
                              Fragment.file.schema,
                              Fragment.extUrl.schema,
                              Fragment.moduleExtTool.schema,
                              Fragment.extTool.schema,
                              Fragment.quiz.schema,
                              Fragment.discussion.schema.omit({
                                entries: true,
                              }),
                            ])
                            .nullable(),
                        })
                        .array()
                        .nullable(),
                    })
                    .nullable()
                    .array()
                    .nullable(),
                }),
              })
              .nullable(),
          })
          .array(),
      })
      .nullable()
      .array()
      .nullable(),
  }),
});

/**
 * A pre-fabricated query for creating a Model.
 */
// export const bigModelQuery = Graph.schemaToSafeRequest({
//   params: true,
//   body: (variables: { id: number }) => {
//     return {
//       q: gql`
//         fragment EnrollmentFragment on Enrollment {
//           id: _id
//           state
//           htmlUrl
//         }
//         fragment RubricFragment on Rubric {
//           id: _id
//           title
//           pointsPossible
//           criteria {
//             id: _id
//             description
//             longDescription
//             points
//           }
//         }
//         fragment SubmissionFragment on Submission {
//           id: _id
//           gradingStatus
//           submittedAt
//           grade
//           score
//           enteredGrade
//           enteredScore
//           late
//           missing
//           isCurrent: gradeMatchesCurrentSubmission
//           latePolicyStatus
//           attachment {
//             ...FileFragment
//           }
//         }
//         fragment CourseFragment on Course {
//           id: _id
//           name
//           courseCode
//         }
//         fragment ModuleFragment on Module {
//           id: _id
//           name
//           position
//         }
//         fragment ModuleItemFragment on ModuleItem {
//           id: _id
//           url
//         }
//         fragment SubHeaderFragment on SubHeader {
//           type: __typename
//           title
//         }
//         fragment PageFragment on Page {
//           type: __typename
//           id: _id
//           title
//           createdAt
//           updatedAt
//         }
//         fragment AssignmentFragment on Assignment {
//           type: __typename
//           id: _id
//           name
//           description
//           url: htmlUrl
//           pointsPossible
//           rubric {
//             ...RubricFragment
//           }
//           createdAt
//           dueAt
//           lockAt
//           updatedAt
//           state
//           allowedAttempts
//           submissions: submissionsConnection {
//             grades: nodes {
//               ...SubmissionFragment
//             }
//           }
//         }
//         fragment FileFragment on File {
//           type: __typename
//           id: _id
//           contentType
//           url
//         }
//         fragment ExtUrlFragment on ExternalUrl {
//           type: __typename
//           id: _id
//           title
//           extUrl: url
//         }
//         fragment ModuleExtToolFragment on ModuleExternalTool {
//           type: __typename
//           id: _id
//           modUrl: url
//         }
//         fragment ExtToolFragment on ExternalTool {
//           type: __typename
//           id: _id
//           name
//           description
//           url
//         }
//         fragment DiscussionFragment on Discussion {
//           type: __typename
//           id: _id
//           title
//           entries: discussionEntriesConnection {
//             posts: nodes {
//               id: _id
//               author {
//                 id: _id
//                 name
//                 shortName
//                 pronouns
//               }
//               message
//               attachment {
//                 ...FileFragment
//               }
//               subentriesCount
//               createdAt
//               updatedAt
//             }
//           }
//         }
//         fragment QuizFragment on Quiz {
//           type: __typename
//           id: _id
//           createdAt
//           updatedAt
//         }

//         query ModelQuery($id: ID!) {
//           Model: legacyNode(_id: $id, type: User) {
//             ... on User {
//               enrollments {
//                 ...EnrollmentFragment
//                 course {
//                   ...CourseFragment
//                   modulesConnection {
//                     modules: nodes {
//                       ...ModuleFragment
//                       items: moduleItems {
//                         ...ModuleItemFragment
//                         content {
//                           ...SubHeaderFragment
//                           ...PageFragment
//                           ...AssignmentFragment
//                           ...FileFragment
//                           ...ExtUrlFragment
//                           ...ModuleExtToolFragment
//                           ...ExtToolFragment
//                           ...DiscussionFragment
//                           ...QuizFragment
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       `,
//       variables,
//     };
//   },
//   schema: z
//     .object({
//       Model: z.object({
//         enrollments: Fragment.enrollment.schema
//           .extend({
//             course: Fragment.course.schema
//               .extend({
//                 modulesConnection: z
//                   .object({
//                     modules: Fragment.module.schema
//                       .extend({
//                         items: Fragment.module.schema
//                           .extend({
//                             content: z
//                               .discriminatedUnion("type", [
//                                 Fragment.subHeader.schema,
//                                 Fragment.page.schema,
//                                 Fragment.assignment.schema,
//                                 Fragment.file.schema,
//                                 Fragment.extUrl.schema,
//                                 Fragment.moduleExtTool.schema,
//                                 Fragment.extTool.schema,
//                                 Fragment.discussion.schema,
//                                 Fragment.quiz.schema,
//                               ])
//                               .nullish(),
//                           })
//                           .array()
//                           .nullish(),
//                       })
//                       .nullish()
//                       .array()
//                       .nullish(),
//                   })
//                   .nullish(),
//               })
//               .nullish(),
//           })
//           .array(),
//       }),
//     })
//     .transform(({ Model }) => Model.enrollments),
// });

export const modifiedModelQuery = Graph.schemaToSafeRequest({
  params: false,
  body: () => ({
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
        discussion {
          ...DiscussionFragment
        }
        quiz {
          ...QuizFragment
        }
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
      }
      fragment QuizFragment on Quiz {
        type: __typename
        id: _id
        createdAt
        updatedAt
      }
      
      query ModifiedModelQuery {
        allCourses {
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
                }
              }
            }
          }
        }
      } 
    `,
  }),
  schema: z
    .object({
      allCourses: Fragment.course.schema
        .extend({
          modulesConnection: z
            .object({
              modules: Fragment.module.schema
                .extend({
                  items: Fragment.moduleItem.schema
                    .extend({
                      content: z
                        .discriminatedUnion("type", [
                          Fragment.subHeader.schema,
                          Fragment.page.schema,
                          Fragment.assignment.schema.extend({
                            discussion: Fragment.discussion.schema
                              .omit({
                                entries: true,
                              })
                              .nullish(),
                            quiz: Fragment.quiz.schema.nullish(),
                          }),
                          Fragment.file.schema,
                          Fragment.extUrl.schema,
                          Fragment.moduleExtTool.schema,
                          Fragment.extTool.schema,
                          Fragment.quiz.schema,
                          Fragment.discussion.schema.omit({ entries: true }),
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
        .nullable()
        .array()
        .nullable(),
    })
    .transform(({ allCourses }) => allCourses),
});

export const singleCourseQuery = Graph.schemaToSafeRequest({
  params: true,
  body: (variables: { courseId: number }) => ({
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
        discussion {
          ...DiscussionFragment
        }
        quiz {
          ...QuizFragment
        }
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
      }
      fragment QuizFragment on Quiz {
        type: __typename
        id: _id
        createdAt
        updatedAt
      }
      
      query SingleCourseQuery($courseId: ID!) {
        course(id: $courseId) {
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
      course: Fragment.course.schema
        .extend({
          modulesConnection: z
            .object({
              modules: Fragment.module.schema
                .extend({
                  items: Fragment.module.schema
                    .extend({
                      content: z
                        .discriminatedUnion("type", [
                          Fragment.subHeader.schema,
                          Fragment.page.schema,
                          Fragment.assignment.schema.extend({
                            discussion: Fragment.discussion.schema
                              .omit({
                                entries: true,
                              })
                              .nullish(),
                            quiz: Fragment.quiz.schema.nullish(),
                          }),
                          Fragment.file.schema,
                          Fragment.extUrl.schema,
                          Fragment.moduleExtTool.schema,
                          Fragment.extTool.schema,
                          Fragment.quiz.schema,
                          Fragment.discussion.schema.omit({ entries: true }),
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
    .transform(({ course }) => course),
});
