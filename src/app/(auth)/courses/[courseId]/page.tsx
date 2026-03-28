import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import "@/model/User";
import { notFound } from "next/navigation"
import Link from "next/link"
import { BookOpen, PlayCircle, User, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import EnrollButton from "@/components/ui/EnrollButton";
import BackButton from "@/components/ui/BackButton";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    await dbConnect()
    const { courseId } = await params
    const course = await CourseModel.findById(courseId)
        .populate("instructor", "username email")
    if (!course) {
        notFound()
    }
    const instId = course.instructor as any
    const instructorName = typeof instId === 'object' && instId !== null
        ? (instId.username || instId.email || 'Instructor')
        : 'Instructor'

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* BACK BUTTON */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <BackButton fallbackHref="/courses" label="Back to Courses" variant="ghost" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT - Course Main Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Thumbnail */}
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-slate-300" />
                                </div>
                            )}
                        </div>

                        {/* Title & Instructor */}
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                {course.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-3 text-slate-500">
                                <User className="h-4 w-4" />
                                <span className="font-medium">by {instructorName}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-3">About This Course</h2>
                            <p className="text-slate-600 leading-relaxed">{course.description}</p>
                        </div>

                        {/* Chapters List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-5">
                                <LayoutList className="h-5 w-5 text-[#1A237E]" />
                                <h2 className="text-xl font-bold text-slate-800">
                                    Course Content ({course.chapters?.length || 0} chapters)
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {(course.chapters as any[])?.map((chapter: any, index: number) => (
                                    <div
                                        key={chapter._id?.toString() || index}
                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <div className="h-8 w-8 bg-[#1A237E]/10 rounded-full flex items-center justify-center shrink-0">
                                            <PlayCircle className="h-4 w-4 text-[#1A237E]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">
                                                {index + 1}. {chapter.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - Sticky Enroll Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-5">
                            <div className="text-center">
                                <span className="text-4xl font-extrabold text-[#1A237E]">FREE</span>
                                <p className="text-slate-500 text-sm mt-1">Full lifetime access</p>
                            </div>

                            {/* This is the interactive client component */}
                            <EnrollButton courseId={courseId} />

                            <ul className="text-sm text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                                <li className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-[#1A237E] shrink-0" />
                                    {course.chapters?.length || 0} on-demand lessons
                                </li>
                                <li className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#1A237E] shrink-0" />
                                    Taught by {instructorName}
                                </li>
                                <li className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-[#1A237E] shrink-0" />
                                    Full course access on enrollment
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}