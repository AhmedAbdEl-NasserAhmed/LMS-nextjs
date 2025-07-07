"use server";

import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, courseSchemaType } from "@/lib/zodSchema";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: []
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5
    })
  );

export async function editCourse(
  data: courseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  const user = await requireAdmin();

  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: user?.user.id as string
    });

    if (decision.isDenied()) {
      return {
        status: "Error",
        message: "Not Allowed"
      };
    }

    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "Error",
        message: "Invalid data"
      };
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.session.id
      },
      data: {
        ...result.data
      }
    });

    return {
      status: "Success",
      message: "Course  updated succesfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to update course"
    };
  }
}
export async function reorderLesson(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "Error",
        message: "No lessons provided for reordering"
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lessson.update({
        where: {
          id: lesson.id,
          chapterId
        },
        data: {
          position: lesson.position
        }
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "Success",
      message: "Lesson reordered successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to reorder Lessons "
    };
  }
}

export async function reorderChapter(
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "Error",
        message: "No chapters provided for reordering"
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId
        },
        data: {
          position: chapter.position
        }
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "Success",
      message: "Chpaters reordered successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to redorder chapters"
    };
  }
}
