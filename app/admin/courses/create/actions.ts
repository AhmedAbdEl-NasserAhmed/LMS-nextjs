"use server";

import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, courseSchemaType } from "@/lib/zodSchema";
import { request } from "@arcjet/next";
import { NextResponse } from "next/server";

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

export async function CreateCourse(
  values: courseSchemaType
): Promise<ApiResponse> {
  const session = await requireAdmin();
  try {
    const req = await request();

    const decision = await arcjet.protect(req, {
      fingerprint: session?.user.id as string
    });

    if (decision.isDenied()) {
      return {
        status: "Error",
        message: "Not Allowed"
      };
    }

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
