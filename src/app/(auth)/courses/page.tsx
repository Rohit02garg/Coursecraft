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
            <div className="bg-white border-b border-slate-100 shadow-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard">
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center transition-colors">
                                <ChevronLeft className="h-3 w-3 mr-1" /> Dashboard
                            </button>
                        </Link>
                        <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                                Explore Courses
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">
                                {courses.length} {courses.length === 1 ? "course" : "courses"} available
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* COURSES GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {courses.map((course: any) => {
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
                    <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-10 w-10 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catalog is empty</h2>
                        <p className="text-slate-500 mt-3 font-medium">Check back soon for new premium courses.</p>
                    </div>
                )}
            </div>
        </div>
    )
}