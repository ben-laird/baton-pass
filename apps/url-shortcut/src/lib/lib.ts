import { z } from "zod";
import { parseDate } from "chrono-node";
import { format, parseISO } from "date-fns";

// Things date strings

export type DateStringInput = z.input<typeof dateStringInput>;

export const dateStringInput = z.union([z.string(), z.date()]);

export const dateString = dateStringInput.transform((a) => {
  if (typeof a === "string") {
    if (a === "anytime" || a === "someday") {
      return a;
    }
    return format(parseDate(a), "MMMM do, y");
  }
  return format(a, "MMMM do, y");
});

export type DateString = z.output<typeof dateString>;

// Things time strings

const timeRegex =
  /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))|^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export type TimeStringInput = z.input<typeof timeStringInput>;

export const timeStringInput = z.union([z.string().regex(timeRegex), z.date()]);

export const timeString = timeStringInput.transform((a) => {
  if (typeof a === "string") {
    return format(parseDate(a), "h aaa");
  }
  return format(a, "h aaa");
});

export type TimeString = z.output<typeof timeString>;

// Things datetime strings

export type DateTimeStringInput = z.input<typeof dateStringInput>;

export const dateTimeStringInput = z.union([
  z.string().datetime(),
  z.string().includes("@"),
  z.date(),
]);

export const dateTimeString = dateTimeStringInput.transform((a, ctx) => {
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

export type DateTimeString = z.output<typeof dateTimeString>;

// Things Projects

export const projectSchema = z.object({
  type: z.literal("project"),
  attributes: z
    .object({
      title: z.string().optional(),
      notes: z.string().optional(),
      when: z
        .union([
          z.enum(["today", "tomorrow", "evening", "anytime", "someday"]),
          dateString,
        ])
        .optional(),
      deadline: dateString.optional(),
      tags: z.string().array().optional(),
      completed: z.boolean().optional(),
      canceled: z.boolean().optional(),
      "creation-date": dateString.optional(),
      "completion-date": dateString.optional(),
    })
    .and(
      z.union([
        z.object({ "area-id": z.string().uuid().optional() }),
        z.object({ area: z.string().optional() }),
      ]),
    ),
});

export type ProjectInput = z.input<typeof projectSchema>;

export type ProjectOutput = z.output<typeof projectSchema>;
