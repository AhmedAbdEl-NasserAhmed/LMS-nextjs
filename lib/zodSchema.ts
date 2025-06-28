import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
  "Development",
  "Business",
  "Finance",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Health & Fitness",
  "Music",
  "Teaching & Academics"
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be at most 100 characters long" }),

  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),

  fileKey: z.string().min(1, { message: "File key is required" }),

  price: z.coerce.number().min(1, { message: "Prize must be at least 1" }),

  duration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 hour" })
    .max(500, { message: "Duration must be at most 500 hours" }),

  level: z.enum(courseLevels, {
    errorMap: () => ({ message: "Invalid course level" })
  }),

  category: z.enum(courseCategories, {
    message: "Category is required"
  }),

  smallDescription: z
    .string()
    .min(3, { message: "Small description must be at least 3 characters" })
    .max(300, { message: "Small description must be at most 300 characters" }),

  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),

  status: z.enum(courseStatus, {
    errorMap: () => ({ message: "Invalid course status" })
  })
});

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean()
});

export type courseSchemaType = z.infer<typeof courseSchema>;
