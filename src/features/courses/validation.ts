import { getIn, setIn, type FormikErrors } from "formik";
import { z } from "zod";
import type { CourseDraft } from "@/features/courses/types";

const HTTP_URL = /^https?:\/\/.+/i;

const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "Enter the question text.")
    .max(1000, "Question is too long (max 1000 characters)."),
  choices: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Choice cannot be empty.")
        .max(500, "Choice is too long (max 500 characters).")
    )
    .min(2, "Add at least 2 choices.")
    .refine((choices) => new Set(choices).size === choices.length, "Choices must be unique."),
  correctIndex: z
    .number()
    .nullable()
    .refine((value) => value !== null, "Select the correct answer."),
  points: z
    .number({ invalid_type_error: "Enter points." })
    .min(0, "Points cannot be negative."),
});

const quizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Quiz title must be at least 2 characters.")
    .max(150, "Quiz title is too long (max 150 characters)."),
  questions: z.array(questionSchema),
});

const lectureBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Lecture title must be at least 2 characters.")
    .max(150, "Lecture title is too long (max 150 characters)."),
  quizzes: z.array(quizSchema),
});

const lectureSchema = z.discriminatedUnion("source", [
  lectureBaseSchema.extend({ source: z.literal("none") }),
  lectureBaseSchema.extend({
    source: z.literal("link"),
    lectureLink: z.string().trim().regex(HTTP_URL, "Enter a valid http/https link."),
  }),
  lectureBaseSchema.extend({
    source: z.literal("file"),
    file: z.custom<File>((value) => value instanceof File, "Choose a file to upload."),
  }),
]);

const courseDraftSchema = z.object({
  instructorId: z.string().min(1, "Select an instructor for this course."),
  title: z
    .string()
    .trim()
    .min(2, "Course title must be at least 2 characters.")
    .max(150, "Course title is too long (max 150 characters)."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description is too long (max 2000 characters)."),
  price: z
    .number({ invalid_type_error: "Enter a price (0 for a free course)." })
    .min(0, "Price cannot be negative."),
  durationDays: z
    .number({ invalid_type_error: "Enter the access duration in days." })
    .int("Use a whole number of days.")
    .min(1, "Access must be at least 1 day."),
  certificateTemplate: z
    .string()
    .trim()
    .refine((value) => !value || HTTP_URL.test(value), "Enter a valid http/https URL."),
  lectures: z.array(lectureSchema),
  fullQuiz: quizSchema.nullable(),
});

export function validateCourseDraft(values: CourseDraft): FormikErrors<CourseDraft> {
  const result = courseDraftSchema.safeParse(values);
  if (result.success) return {};

  let errors: FormikErrors<CourseDraft> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.map(String);
    // Formik stores one message per path, and a string on a parent path can't also hold child errors.
    const isTaken =
      getIn(errors, path) !== undefined ||
      path.some((_, index) => typeof getIn(errors, path.slice(0, index + 1)) === "string");
    if (!isTaken) errors = setIn(errors, path.join("."), issue.message);
  }
  return errors;
}
