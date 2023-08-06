import { gql } from "graphql-request";
import { z } from "zod";

import { GraphQLSchema } from "./lib";
import { subjectCodesVal } from "./subjects";

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a grade or a set of grades.
 */
export const grades = {
  body: () => ({
    q: gql`
      fragment GradesFragment on Grades {
        currentGrade
        currentScore
        finalGrade
        finalScore
        unpostedCurrentGrade
        unpostedCurrentScore
        unpostedFinalGrade
        unpostedFinalScore
      }
    `,
  }),
  schema: z.object({
    currentGrade: z.string().nullable(),
    currentScore: z.coerce.number().nullable(),
    finalGrade: z.string().nullable(),
    finalScore: z.coerce.number().nullable(),
    unpostedCurrentGrade: z.string().nullable(),
    unpostedCurrentScore: z.coerce.number().nullable(),
    unpostedFinalGrade: z.string().nullable(),
    unpostedFinalScore: z.coerce.number().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an enrollment.
 */
export const enrollment = {
  body: () => ({
    q: gql`
      fragment GradesFragment on Grades {
        currentGrade
        currentScore
        finalGrade
        finalScore
        unpostedCurrentGrade
        unpostedCurrentScore
        unpostedFinalGrade
        unpostedFinalScore
      }
      fragment EnrollmentFragment on Enrollment {
        id: _id
        state
        htmlUrl
        grades {
          ...GradesFragment
        }
      }
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    state: z.string(),
    htmlUrl: z.string().url().nullable(),
    grades: z
      .object({
        currentGrade: z.string().nullable(),
        currentScore: z.coerce.number().nullable(),
        finalGrade: z.string().nullable(),
        finalScore: z.coerce.number().nullable(),
        unpostedCurrentGrade: z.string().nullable(),
        unpostedCurrentScore: z.coerce.number().nullable(),
        unpostedFinalGrade: z.string().nullable(),
        unpostedFinalScore: z.coerce.number().nullable(),
      })
      .nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a course.
 */
export const course = {
  body: () => ({
    q: gql`
      fragment CourseFragment on Course {
        id: _id
        name
        courseCode
      }
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    name: z.string().transform((a) => {
      const matches = a.match(/(\w{4})(\d{3}): (.+?) \((\d{3})\)/);

      return matches
        ? {
            subject: subjectCodesVal.parse(matches[1]),
            class: matches[2],
            title: matches[3],
            section: parseInt(matches[4]),
          }
        : a;
    }),
    courseCode: z
      .string()
      .nullable()
      .transform((a) => {
        const matches = a?.match(/(\w{4})(\d{3})_(\d{3})_(\d{4})(\d{2})/);

        return matches
          ? {
              courseCode: {
                subject: subjectCodesVal.parse(matches[1]),
                class: parseInt(matches[2]),
                section: parseInt(matches[3]),
              },
              termCode: {
                year: parseInt(matches[4]),
                term: parseInt(matches[5]),
              },
            }
          : a;
      }),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a module.
 */
export const module = {
  body: () => ({
    q: gql`
      fragment ModuleFragment on Module {
        id: _id
        name
        position
      }
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    name: z.string().nullable(),
    position: z.coerce.number().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a module item.
 */
export const moduleItem = {
  body: () => ({
    q: gql`
      fragment ModuleItemFragment on ModuleItem {
        id: _id
        url
      }
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    url: z.string().url().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a subheader.
 */
export const subHeader = {
  body: () => ({
    q: gql`
      fragment SubHeaderFragment on SubHeader {
        type: __typename
        title
      }
    `,
  }),
  schema: z.object({
    type: z.literal("SubHeader"),
    title: z.string().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a page.
 */
export const page = {
  body: () => ({
    q: gql`
      fragment PageFragment on Page {
        type: __typename
        id: _id
        title
        createdAt
        updatedAt
      }
    `,
  }),
  schema: z.object({
    type: z.literal("Page"),
    id: z.coerce.number(),
    title: z.string().nullable(),
    createdAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a file.
 */
export const file = {
  body: () => ({
    q: gql`
      fragment FileFragment on File {
        type: __typename
        id: _id
        contentType
        url
      }
    `,
  }),
  schema: z.object({
    type: z.literal("File"),
    id: z.coerce.number(),
    contentType: z.string().nullable(),
    url: z.string().url().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an external tool.
 */
export const extTool = {
  body: () => ({
    q: gql`
      fragment ExtToolFragment on ExternalTool {
        type: __typename
        id: _id
        name
        description
        url
      }
    `,
  }),
  schema: z.object({
    type: z.literal("ExternalTool"),
    id: z.coerce.number(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    url: z.string().url().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a discussion.
 */
export const discussion = {
  body: () => ({
    q: gql`
      fragment FileFragment on File {
        type: __typename
        id: _id
        contentType
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
    `,
  }),
  schema: z.object({
    type: z.literal("Discussion"),
    id: z.coerce.number(),
    title: z.string().nullable(),
    entries: z
      .object({
        posts: z
          .object({
            id: z.coerce.number(),
            author: z
              .object({
                id: z.coerce.number(),
                name: z.string().nullable(),
                shortname: z.string().nullable(),
                pronouns: z.string().nullable(),
              })
              .nullable(),
            message: z.string().nullable(),
            attachment: z
              .object({
                type: z.literal("File"),
                id: z.coerce.number(),
                contentType: z.string().nullable(),
                url: z.string().url().nullable(),
              })
              .nullable(),
            subentriesCount: z.coerce.number().nullable(),
            createdAt: z.coerce.date().nullable(),
            updatedAt: z.coerce.date().nullable(),
          })
          .nullable()
          .array()
          .nullable(),
      })
      .nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a quiz.
 */
export const quiz = {
  body: () => ({
    q: gql`
      fragment QuizFragment on Quiz {
        type: __typename
        id: _id
        createdAt
        updatedAt
      }
    `,
  }),
  schema: z.object({
    type: z.literal("Quiz"),
    id: z.coerce.number(),
    createdAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an external URL.
 */
export const extUrl = {
  body: () => ({
    q: gql`
      fragment ExtUrlFragment on ExternalUrl {
        type: __typename
        id: _id
        title
        extUrl: url
      }
    `,
  }),
  schema: z.object({
    type: z.literal("ExternalUrl"),
    id: z.coerce.number(),
    title: z.string().nullable(),
    extUrl: z.string().url().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a module's external tool.
 */
export const moduleExtTool = {
  body: () => ({
    q: gql`
      fragment ModuleExtToolFragment on ModuleExternalTool {
        type: __typename
        id: _id
        modUrl: url
      }
    `,
  }),
  schema: z.object({
    type: z.literal("ModuleExternalTool"),
    id: z.coerce.number(),
    modUrl: z.string().url().nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a rubric.
 */
export const rubric = {
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
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    title: z.string().nullable(),
    pointsPossible: z.coerce.number().nullable(),
    criteria: z
      .object({
        id: z.coerce.number(),
        description: z.string().nullable(),
        longDescription: z.string().nullable(),
        points: z.coerce.number().nullable(),
      })
      .array(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a submission.
 */
export const submission = {
  body: () => ({
    q: gql`
      fragment FileFragment on File {
        type: __typename
        id: _id
        contentType
        url
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
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    gradingStatus: z
      .enum(["needs_grading", "excused", "needs_review", "graded"])
      .nullable(),
    submittedAt: z.coerce.date().nullable(),
    grade: z.string().nullable(),
    score: z.coerce.number().nullable(),
    enteredGrade: z.string().nullable(),
    enteredScore: z.coerce.number().nullable(),
    late: z.boolean().nullable(),
    missing: z.boolean().nullable(),
    isCurrent: z.boolean().nullable(),
    latePolicyStatus: z
      .enum(["late", "missing", "extended", "none"])
      .nullable(),
    attachment: z
      .object({
        type: z.literal("File"),
        id: z.coerce.number(),
        contentType: z.string().nullable(),
        url: z.string().url().nullable(),
      })
      .nullable(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an assignment.
 */
export const assignment = {
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
      fragment FileFragment on File {
        type: __typename
        id: _id
        contentType
        url
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
    `,
  }),
  schema: z.object({
    type: z.literal("Assignment"),
    id: z.coerce.number(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    url: z.string().url().nullable(),
    pointsPossible: z.coerce.number().nullable(),
    rubric: z
      .object({
        id: z.coerce.number(),
        title: z.string().nullable(),
        pointsPossible: z.coerce.number().nullable(),
        criteria: z
          .object({
            id: z.coerce.number(),
            description: z.string().nullable(),
            longDescription: z.string().nullable(),
            points: z.coerce.number().nullable(),
          })
          .array(),
      })
      .nullable(),
    createdAt: z.coerce.date().nullable(),
    dueAt: z.coerce.date().nullable(),
    lockAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date().nullable(),
    state: z.enum([
      "unpublished",
      "published",
      "deleted",
      "duplicating",
      "failed_to_duplicate",
      "importing",
      "fail_to_import",
      "migrating",
      "failed_to_migrate",
    ]),
    allowedAttempts: z.coerce.number().nullable(),
    submissions: z
      .object({
        grades: z
          .object({
            id: z.coerce.number(),
            gradingStatus: z
              .enum(["needs_grading", "excused", "needs_review", "graded"])
              .nullable(),
            submittedAt: z.coerce.date().nullable(),
            grade: z.string().nullable(),
            score: z.coerce.number().nullable(),
            enteredGrade: z.string().nullable(),
            enteredScore: z.coerce.number().nullable(),
            late: z.boolean().nullable(),
            missing: z.boolean().nullable(),
            isCurrent: z.boolean().nullable(),
            latePolicyStatus: z
              .enum(["late", "missing", "extended", "none"])
              .nullable(),
            attachment: z
              .object({
                type: z.literal("File"),
                id: z.coerce.number(),
                contentType: z.string().nullable(),
                url: z.string().url().nullable(),
              })
              .nullable(),
          })
          .nullable()
          .array()
          .nullable(),
      })
      .nullable(),
  }),
} satisfies GraphQLSchema;
