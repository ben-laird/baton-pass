import { parseDate } from "chrono-node";
import { format, parseISO } from "date-fns";
import { z } from "zod";
import { ShortcutURL } from "./url";

export type SuccessInfer<T extends z.SafeParseReturnType<unknown, unknown>> =
  T extends z.SafeParseSuccess<infer I> ? I : never;

export type UnaryVariadic<T> = [T, ...T[]];

export function assertNonEmpty<T>(params: {
  array: Array<T>;
  message?: string;
}): UnaryVariadic<T> {
  const { array, message } = params;
  return z.custom<T>().array().nonempty(message).parse(array);
}

export function guarantee<T>(params: {
  value: T | null | undefined;
  message?: string;
}) {
  const { value, message } = params;
  if (!value) {
    throw new Error(message ?? "Value should not be null or undefined!");
  }

  return value;
}

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

const dateTimeString = z
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

const ISOString = z
  .union([z.string().datetime(), z.date()])
  .transform((a) => {
    if (typeof a === "string") {
      return a;
    }

    return a.toISOString();
  })
  .pipe(z.string().datetime());

// Other utilities

const whenSchema = z
  .discriminatedUnion("style", [
    z.object({
      style: z.literal("special"),
      data: z.enum(["today", "tomorrow", "evening", "anytime", "someday"]),
    }),
    z.object({
      style: z.literal("standard"),
      data: z.union([dateString, dateTimeString]),
    }),
  ])
  .transform((a) => a.data);

const encodedSchema = (separator: string, max?: number) => {
  const base = max
    ? z.string().array().nonempty().max(max)
    : z.string().array().nonempty();

  return base.transform((a) => {
    return a.join(separator);
  });
};

// === FINAL SCHEMA ===

const headingSchema = z.object({
  type: z.literal("heading"),
  attributes: z.object({
    title: z.string().optional(),
    archived: z.boolean().optional(),
  }),
});

const checklistItemSchema = z.object({
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
  when: whenSchema.optional(),
  deadline: dateString.optional(),
  tags: z.string().array().nonempty().optional(),
  "checklist-items": checklistItemSchema.array().nonempty().max(100).optional(),
  "list-id": z.string().uuid().optional(),
  list: z.string().optional(),
  "heading-id": z.string().uuid().optional(),
  heading: z.string().optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
  "creation-date": ISOString.optional(),
  "completion-date": ISOString.optional(),
});

const todoSchema = z.union([
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
      "add-tags": encodedSchema(",").optional(),
      "prepend-checklist-items": encodedSchema("\n", 100).optional(),
      "append-checklist-items": encodedSchema("\n", 100).optional(),
    }),
  }),
]);

// Things Project

const projectAttributes = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  when: whenSchema.optional(),
  deadline: dateString.optional(),
  tags: z.string().array().nonempty().optional(),
  completed: z.boolean().optional(),
  canceled: z.boolean().optional(),
  "creation-date": ISOString.optional(),
  "completion-date": ISOString.optional(),
  "area-id": z.string().uuid().optional(),
  area: z.string().optional(),
});

const projectSchema = z.union([
  z.object({
    type: z.literal("project"),
    operation: z.literal("create"),
    attributes: projectAttributes.extend({
      items: z.union([todoSchema, headingSchema]).array().nonempty().optional(),
    }),
  }),
  z.object({
    type: z.literal("project"),
    operation: z.literal("update"),
    attributes: projectAttributes.extend({
      "prepend-notes": z.string().optional(),
      "append-notes": z.string().optional(),
      "add-tags": encodedSchema(",").optional(),
    }),
  }),
]);

export const thingsJsonSchema = z
  .object({
    "auth-token": z.string().optional(),
    reveal: z.boolean().optional(),
    data: z.union([todoSchema, projectSchema]).array().nonempty(),
  })
  .transform((a) => new ShortcutURL("things:///json").addParams(a));

export type ThingsJsonSchema = z.input<typeof thingsJsonSchema>;
