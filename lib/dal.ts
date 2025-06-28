import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return redirect("/login");

  if (session.user.role !== "admin") return redirect("/not-admin");

  return session;
}

export async function getAdminCourses() {
  await requireAdmin();

  const data = prisma.course.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      description: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true
    }
  });

  return data;
}

export type AdminCourseType = Awaited<ReturnType<typeof getAdminCourses>>[0];
