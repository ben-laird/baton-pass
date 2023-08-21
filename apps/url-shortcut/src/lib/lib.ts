import { z } from "zod";
import { parseDate } from "chrono-node";
import { format, parseISO } from "date-fns";

// === UTILITY SCHEMAS ===

// Things date strings

const dateString = z.union([z.string(), z.date()]).transform((a) => {
  if (typeof a === "string") {
    if (a === "anytime" || a === "someday") {
      return a;
    }
    return format(parseDate(a), "MMMM do, y");
  }
  return format(a, "MMMM do, y");
});

// Things time strings

const timeRegex =
  /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))|^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const timeString = z
  .union([z.string().regex(timeRegex), z.date()])
  .transform((a) => {
    if (typeof a === "string") {
      return format(parseDate(a), "h aaa");
    }
    return format(a, "h aaa");
  });

// Things datetime strings

export const dateTimeString = z
  .union([z.string().datetime(), z.string().includes("@"), z.date()])
  .transform((a, ctx) => {
    if (typeof a === "string") {
      const timeStringFilter = z.string().datetime().safeParse(a);

      if (!timeStringFilter.success) {
        const dateTimeTuple = z
          .tuple([dateString, timeString])
          .safeParse(a.split("@"));

        if (!dateTimeTuple.success) {
          dateTimeTuple.error.issues.forEach((iss) => ctx.addIssue(iss));
          return z.NEVER;
        }
        return dateTimeTuple.data.join("@");
      }
      return format(parseISO(a), "MMMM do, y@h aaa");
    }
    return format(a, "MMMM do, y@h aaa");
  });

// Other utilities

const when = z
  .union([
    z.enum(["today", "tomorrow", "evening", "anytime", "someday"]),
    dateString,
  ])
  .optional();

// === FINAL SCHEMA ===

// These two are exported temporarily

export const headingSchema = z.object({
  type: z.literal("heading"),
  attributes: z.object({
    title: z.string().optional(),
    archived: z.boolean().optional(),
  }),
});

export const checklistItemSchema = z.object({
  type: z.literal("checklist-item"),
  attributes: z.object({
    title: z.string().optional(),
    completed: z.boolean().optional(),
    canceled: z.boolean().optional(),
  }),
});

// Things To-Do

const todoAttributes = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  when,
  deadline: dateString.optional(),
  tags: z.string().array().nonempty().optional(),
  "checklist-items": z.string().array().nonempty().max(100).optional(),
  "list-id": z.string().optional(),
  list: z.string().optional(),
  "heading-id": z.string().optional(),
  heading: z.string().optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
  "creation-date": dateString.optional(),
  "completion-date": dateString.optional(),
});

export const todoSchema = z.union([
  z.object({
    type: z.literal("to-do"),
    operation: z.literal("create"),
    attributes: todoAttributes,
  }),
  z.object({
    type: z.literal("to-do"),
    operation: z.literal("update"),
    attributes: todoAttributes.extend({
      "prepend-notes": z.string().optional(),
      "append-notes": z.string().optional(),
      "add-tags": z
        .string()
        .array()
        .nonempty()
        .transform((a) => {
          return a.join(",");
        })
        .optional(),
      "prepend-checklist-items": z
        .string()
        .array()
        .nonempty()
        .transform((a) => {
          return a.join("\n");
        })
        .optional(),
      "append-checklist-items": z
        .string()
        .array()
        .nonempty()
        .transform((a) => {
          return a.join("\n");
        })
        .optional(),
    }),
  }),
]);

// Things Project

const projectAttributes = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  when,
  deadline: dateString.optional(),
  tags: z.string().array().optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
  "creation-date": dateString.optional(),
  "completion-date": dateString.optional(),
  "area-id": z.string().uuid().optional(),
  area: z.string().optional(),
});

export const projectSchema = z.union([
  z.object({
    type: z.literal("project"),
    operation: z.literal("create"),
    attributes: projectAttributes.extend({
      items: todoSchema.array().nonempty().optional(),
    }),
  }),
  z.object({
    type: z.literal("project"),
    operation: z.literal("update"),
    attributes: projectAttributes.extend({
      "prepend-notes": z.string().optional(),
      "append-notes": z.string().optional(),
      "add-tags": z
        .string()
        .array()
        .nonempty()
        .transform((a) => {
          return a.join(",");
        })
        .optional(),
    }),
  }),
]);

export const thingsJsonSchema = z.object({
  "auth-token": z.string().optional(),
  reveal: z.boolean().optional(),
  data: z.union([todoSchema, projectSchema]).array().nonempty(),
});
