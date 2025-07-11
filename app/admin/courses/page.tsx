import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import AdminCourseCard from "./_components/AdminCourseCard";
import { getAdminCourses } from "@/lib/data/admin/admin";

const CoursesPage = async () => {
  const courses = await getAdminCourses();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Link href="/admin/courses/create" className={buttonVariants()}>
          Create Course
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7 ">
        {courses.map((course) => {
          return <AdminCourseCard key={course.id} data={course} />;
        })}
      </div>
    </>
  );
};

export default CoursesPage;
