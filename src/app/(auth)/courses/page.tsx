import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/ui/CourseCard";

export default async function CoursesPage() {

    await dbConnect()

    // Seedha DB se, koi API call nahi, koi axios nahi!
    const courses = await CourseModel.find({ isPublished: true })
        .populate("instructor", "username email")
        .sort({ createdAt: -1 })
        .lean() // .lean() important hai - fast pure JS objects return karta hai

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* PAGE HEADER */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#1A237E] rounded-full">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Home
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A237E]">
                            Explore All Courses
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            {courses.length} {courses.length === 1 ? "course" : "courses"} available
                        </p>
                    </div>
                </div>
            </div>

            {/* COURSES GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course: any) => {

                            // Instructor safely extract karo - populate ke baad object ho sakta hai
                            const instId = course.instructor
                            const instructorName = typeof instId === 'object' && instId !== null
                                ? (instId.username || instId.email || 'Instructor')
                                : 'Instructor'

                            return (
                                <CourseCard
                                    key={course._id.toString()}
                                    courseId={course._id.toString()}
                                    title={course.title}
                                    description={course.description}
                                    instructorName={instructorName}
                                    thumbnail={course.thumbnail}
                                    chaptersCount={course.chapters?.length || 0}
                                />
                            )
                        })}
                    </div>
                ) : (
                    // Empty State - agar koi course published nahi hai
                    <div className="text-center py-28 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-12 w-12 text-[#1A237E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            No courses available yet
                        </h2>
                        <p className="text-slate-500 mt-3 text-lg">
                            Instructors are working on amazing content. Check back soon!
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}