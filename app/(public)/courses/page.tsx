import { getAllCourses } from "@/lib/data/course/get-all-courses";
import { Suspense } from "react";
import PublicCourseCard, {
  PublicCourseCardSkeleton
} from "../_components/PublicCourseCard";

const PublicCoursesRoute = () => {
  return (
    <div className="mt-5">
      <div className="flex flex-col space-y-2  mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore courses
        </h1>
        <p className="text-muted-foreground">
          This cover our wide range of courses designed to help you achieve your
          learning goals
        </p>
      </div>
      <Suspense fallback={<LoadingSkeletonLayout />}>
        <RenderCourses />
      </Suspense>
    </div>
  );
};

async function RenderCourses() {
  const courses = await getAllCourses();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <PublicCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function LoadingSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <PublicCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default PublicCoursesRoute;
