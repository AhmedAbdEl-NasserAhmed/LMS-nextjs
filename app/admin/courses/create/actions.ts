"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, courseSchemaType } from "@/lib/zodSchema";
import { headers } from "next/headers";

export async function CreateCourse(
  values: courseSchemaType
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const validataion = courseSchema.safeParse(values);
    if (!validataion.success) {
      return {
        status: "Error",
        message: "Invalid form data"
      };
    }

    await prisma.course.create({
      data: {
        ...validataion.data,
        userId: session?.user.id
      }
    });

    return {
      status: "Success",
      message: "Course created succesfully"
    };
  } catch {
    return {
      status: "Error",
      message: "Failed to create a Course"
    };
  }
}
