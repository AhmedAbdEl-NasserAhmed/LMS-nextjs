"use server";

import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/data/admin/admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import {
  chapterSchema,
  chapterSchemaType,
  courseSchema,
  courseSchemaType,
  lessonSchema,
  lessonSchemaType
} from "@/lib/zodSchema";
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

export async function createChapter(
  values: chapterSchemaType
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = chapterSchema.safeParse(values);

    if (!result.data) {
      return {
        status: "Error",
        message: "Invalid Data"
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId
        },
        select: {
          position: true
        },
        orderBy: {
          position: "desc"
        }
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1
        }
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "Success",
      message: "A new Chapter created successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to create a chapter"
    };
  }
}

export async function createLesson(
  values: lessonSchemaType
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = lessonSchema.safeParse(values);

    if (!result.data) {
      return {
        status: "Error",
        message: "Invalid Data"
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = tx.lessson.findFirst({
        where: {
          chapterId: result.data.chapterId
        },
        select: {
          position: true
        },
        orderBy: {
          position: "desc"
        }
      });

      await tx.lessson.create({
        data: {
          title: result.data.name,
          chapterId: result.data.chapterId,
          description: result.data.description,
          thumbnailKey: result.data.thumbnailKey,
          videoKey: result.data.videoKey,
          position: (maxPos?.position ?? 0) + 1
        }
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "Success",
      message: "A new Lesson created successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to create a Lesson"
    };
  }
}

export async function deleteLesson({
  chapterId,
  courseId,
  lessonId
}: {
  chapterId: string;
  courseId: string;
  lessonId: string;
}): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const chapterWithLessons = await prisma.chapter.findUnique({
      where: {
        id: chapterId
      },
      select: {
        lessons: {
          orderBy: {
            position: "asc"
          },
          select: {
            id: true,
            position: true
          }
        }
      }
    });

    if (!chapterWithLessons) {
      return {
        status: "Error",
        message: "Chapter not found "
      };
    }

    const lessons = chapterWithLessons.lessons;

    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

    if (!lessonToDelete) {
      return {
        status: "Error",
        message: "lesson not found in the chapter "
      };
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updates = remainingLessons.map((lesson, index) => {
      return prisma.lessson.update({
        where: { id: lesson.id },
        data: { position: index + 1 }
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.lessson.delete({
        where: {
          id: lessonId,
          chapterId
        }
      })
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "Success",
      message: "Lesson deleted successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to delete a Lesson"
    };
  }
}

export async function deleteChapter({
  chapterId,
  courseId
}: {
  chapterId: string;
  courseId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  const courseWithChapters = await prisma.course.findUnique({
    where: {
      id: courseId
    },
    select: {
      chapter: {
        orderBy: {
          position: "asc"
        },
        select: {
          id: true,
          position: true
        }
      }
    }
  });

  if (!courseWithChapters) {
    return {
      status: "Error",
      message: "Course not found "
    };
  }

  const cahpters = courseWithChapters.chapter;

  const chapterToDelete = cahpters.find((chapter) => chapter.id === chapterId);

  if (!chapterToDelete) {
    return {
      status: "Error",
      message: "chapter not found in the course "
    };
  }

  const remainingChapters = cahpters.filter(
    (chapter) => chapter.id !== chapterId
  );

  const updates = remainingChapters.map((chapter, index) => {
    return prisma.chapter.update({
      where: { id: chapter.id },
      data: { position: index + 1 }
    });
  });

  await prisma.$transaction([
    ...updates,
    prisma.chapter.delete({
      where: {
        id: chapterId
      }
    })
  ]);

  revalidatePath(`/admin/courses/${courseId}/edit`);

  try {
    return {
      status: "Success",
      message: "Chapter deleted successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to delete a chapter"
    };
  }
}
