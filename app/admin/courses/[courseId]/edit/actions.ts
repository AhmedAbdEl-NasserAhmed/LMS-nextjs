"use server";

import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, courseSchemaType } from "@/lib/zodSchema";
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

export async function editCourse(
  data: courseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  const user = await requireAdmin();

  try {
    const req = await request();

    const decision = await arcjet.protect(req, {
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
