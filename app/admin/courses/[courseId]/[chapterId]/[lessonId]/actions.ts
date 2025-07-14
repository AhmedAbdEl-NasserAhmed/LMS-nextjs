"use server";

import { requireAdmin } from "@/lib/data/admin/admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { lessonSchema, lessonSchemaType } from "@/lib/zodSchema";

export async function upadteLesson(
  values: lessonSchemaType,
  lessonId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = lessonSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "Error",
        message: "invalid data"
      };
    }

    await prisma.lessson.update({
      where: {
        id: lessonId
      },
      data: {
        title: result.data.name,
        description: result.data.description,
        thumbnailKey: result.data.thumbnailKey,
        videoKey: result.data.videoKey
      }
    });

    return {
      status: "Success",
      message: "Course updated Successfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to update course"
    };
  }
}
