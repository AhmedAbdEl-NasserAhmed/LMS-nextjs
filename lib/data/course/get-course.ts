import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getIndividualCourse(slug: string) {
  const data = await prisma.course.findUnique({
    where: {
      slug
    },
    select: {
      title: true,
      price: true,
      smallDescription: true,
      description: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: true,
      chapter: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true
            },
            orderBy: {
              position: "asc"
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  });

  if (!data) return notFound();

  return data;
}

export type PublicSingleCourseType = Awaited<
  ReturnType<typeof getIndividualCourse>
>;
