"use server";

import { requireAdmin } from "@/lib/data/admin/admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchemaType } from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

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

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
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
