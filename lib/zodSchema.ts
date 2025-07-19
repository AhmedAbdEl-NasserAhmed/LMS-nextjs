import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
  "Development",
  "Business",
  "Finance",
  "IT & Software",
  "Office Productivity",
  "PersonalDevelopment",
  "Design",
  "Marketing",
  "Health Fitness",
  "Music",
  "Teaching Academics"
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
    errorMap: () => ({ message: "Invalid course category" })
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

export const chapterSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" })
});

export const lessonSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
  chapterId: z.string().uuid({ message: "Invalid chapter id" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional()
});

export const userSignUpSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
          "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      }),

    confirmPassword: z.string(),

    name: z.string().min(1, { message: "Name is required" }),

    userImage: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"] // error will show under the confirmPassword field
  });

export type courseSchemaType = z.infer<typeof courseSchema>;
export type chapterSchemaType = z.infer<typeof chapterSchema>;
export type lessonSchemaType = z.infer<typeof lessonSchema>;
export type signupUserType = z.infer<typeof userSignUpSchema>;
