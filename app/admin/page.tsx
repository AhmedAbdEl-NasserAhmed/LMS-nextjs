import EmptyState from "@/components/general/EmptyState";
import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { SectionCards } from "@/components/sidebar/section-cards";
import { buttonVariants } from "@/components/ui/button";
import { getAdminRecentCourses } from "@/lib/data/admin/admin";
import Link from "next/link";
import AdminCourseCard from "./courses/_components/AdminCourseCard";
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <SectionCards />
      <ChartAreaInteractive />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Courses</h2>
          <Link
            href="/admin/courses"
            className={buttonVariants({
              variant: "outline"
            })}
          >
            View All Courses
          </Link>
        </div>
        <Suspense fallback={<p>loading....</p>}>
          {<RenderRecentCourses />}
        </Suspense>
      </div>
    </>
  );
}

async function RenderRecentCourses() {
  const data = await getAdminRecentCourses();

  if (data.length === 0)
    return (
      <EmptyState
        title="You do not have any courses yet!"
        href="/admin/courses/create"
        buttonText="Create new Course"
        description="you do not have any courses. create some to see them here"
      />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((course) => (
        <AdminCourseCard key={course.id} data={course} />
      ))}
    </div>
  );
}
