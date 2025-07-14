"use server";

import { requireAdmin } from "@/lib/data/admin/admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchemaType } from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
  await requireAdmin();
  try {
    await prisma.course.delete({
      where: {
        id: courseId
      }
    });

    revalidatePath("/admin/courses");

    return {
      status: "Success",
      message: "Course deleated succesfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to delete a Course"
    };
  }
}
