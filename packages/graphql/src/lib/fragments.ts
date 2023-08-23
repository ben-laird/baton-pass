import { gql } from "graphql-request";
import { z } from "zod";

import { GraphQLSchema } from "./lib";
import { subjectCodesVal } from "./subjects";

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a grade or a set of grades.
 */
export const grades = {
  params: false,
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
    currentGrade: z.string().nullish(),
    currentScore: z.coerce.number().nullish(),
    finalGrade: z.string().nullish(),
    finalScore: z.coerce.number().nullish(),
    unpostedCurrentGrade: z.string().nullish(),
    unpostedCurrentScore: z.coerce.number().nullish(),
    unpostedFinalGrade: z.string().nullish(),
    unpostedFinalScore: z.coerce.number().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an enrollment.
 */
export const enrollment = {
  params: false,
  body: () => ({
    q: gql`
      fragment EnrollmentFragment on Enrollment {
        id: _id
        state
        htmlUrl
      }
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    state: z.enum([
      "invited",
      "creation_pending",
      "active",
      "deleted",
      "rejected",
      "completed",
      "inactive",
    ]),
    htmlUrl: z.string().url().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a course.
 */
export const course = {
  params: false,
  body: () => ({
    q: gql`
      fragment CourseFragment on Course {
        id: _id
        name
        courseCode
        syllabusBody
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
      .nullish()
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
    syllabusBody: z.string().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a module.
 */
export const module = {
  params: false,
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
    name: z.string().nullish(),
    position: z.number().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a module item.
 */
export const moduleItem = {
  params: false,
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
    url: z.string().url().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a subheader.
 */
export const subHeader = {
  params: false,
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
    title: z.string().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a page.
 */
export const page = {
  params: false,
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
    title: z.string().nullish(),
    createdAt: z.coerce.date().nullish(),
    updatedAt: z.coerce.date().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a file.
 */
export const file = {
  params: false,
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
    contentType: z.string().nullish(),
    url: z.string().url().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an external tool.
 */
export const extTool = {
  params: false,
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
    name: z.string().nullish(),
    description: z.string().nullish(),
    url: z.string().url().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a discussion.
 */
export const discussion = {
  params: false,
  body: () => ({
    q: gql`
      ${file.body().q}

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
    title: z.string().nullish(),
    entries: z
      .object({
        posts: z
          .object({
            id: z.coerce.number(),
            author: z
              .object({
                id: z.coerce.number(),
                name: z.string().nullish(),
                shortname: z.string().nullish(),
                pronouns: z.string().nullish(),
              })
              .nullish(),
            message: z.string().nullish(),
            attachment: file.schema.nullish(),
            subentriesCount: z.coerce.number().nullish(),
            createdAt: z.coerce.date().nullish(),
            updatedAt: z.coerce.date().nullish(),
          })
          .nullish()
          .array()
          .nullish(),
      })
      .nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a quiz.
 */
export const quiz = {
  params: false,
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
    createdAt: z.coerce.date().nullish(),
    updatedAt: z.coerce.date().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an external URL.
 */
export const extUrl = {
  params: false,
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
    title: z.string().nullish(),
    extUrl: z.string().url().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a module's external tool.
 */
export const moduleExtTool = {
  params: false,
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
    modUrl: z.string().url().nullish(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a rubric.
 */
export const rubric = {
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
    `,
  }),
  schema: z.object({
    id: z.coerce.number(),
    title: z.string().nullish(),
    pointsPossible: z.coerce.number().nullish(),
    criteria: z
      .object({
        id: z.union([z.string(), z.number()]),
        description: z.string().nullish(),
        longDescription: z.string().nullish(),
        points: z.coerce.number().nullish(),
      })
      .array(),
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for a submission.
 */
export const submission = {
  params: false,
  body: () => ({
    q: gql`
      ${file.body().q}

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
      .nullish(),
    submittedAt: z.coerce.date().nullish(),
    grade: z.string().nullish(),
    score: z.coerce.number().nullish(),
    enteredGrade: z.string().nullish(),
    enteredScore: z.coerce.number().nullish(),
    late: z.boolean().nullish(),
    missing: z.boolean().nullish(),
    isCurrent: z.boolean().nullish(),
    latePolicyStatus: z.enum(["late", "missing", "extended", "none"]).nullish(),
    attachment: file.schema,
  }),
} satisfies GraphQLSchema;

/**
 * A pre-fabricated GraphQL fragment and validator to specify arguments for an assignment.
 */
export const assignment = {
  params: false,
  body: () => ({
    q: gql`
      ${rubric.body().q}
      ${file.body().q}
      ${submission.body().q}

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
    name: z.string().nullish(),
    description: z.string().nullish(),
    url: z.string().url().nullish(),
    pointsPossible: z.coerce.number().nullish(),
    rubric: rubric.schema.nullish(),
    createdAt: z.coerce.date().nullish(),
    dueAt: z.coerce.date().nullish(),
    lockAt: z.coerce.date().nullish(),
    updatedAt: z.coerce.date().nullish(),
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
    allowedAttempts: z.coerce.number().nullish(),
    submissions: z.object({ grades: grades.schema }).array().catch([]),
  }),
} satisfies GraphQLSchema;
