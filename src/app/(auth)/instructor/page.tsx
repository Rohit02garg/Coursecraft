import dbConnect from "@/lib/dbConnect"
import CourseModel from "@/model/Course"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, BookOpen, Eye, EyeOff, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import SignOutButton from "@/components/ui/SignOutButton"

export default async function InstructorPage() {

    await dbConnect()

    const session = await auth()
    const user = session?.user

    // Agar INSTRUCTOR nahi hai toh seedha dashboard pe bhejo
    if (!user || user.role !== "INSTRUCTOR") {
        redirect("/dashboard")
    }

    // Sirf is instructor ke courses fetch karo
    const courses = await CourseModel.find({ instructor: user._id })
        .sort({ createdAt: -1 })
        .lean()

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-100 shadow-none">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                            Instructor Studio
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                            {courses.length} {courses.length === 1 ? "course" : "courses"} created
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/instructor/courses/new">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm h-11 px-6 font-bold text-sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Course
                            </Button>
                        </Link>
                        <SignOutButton />
                    </div>
                </div>
            </div>

            {/* COURSES LIST */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {courses.map((course: any) => (
                            <div
                                key={course._id.toString()}
                                className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-6 group hover:border-indigo-100 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="h-16 w-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-opacity group-hover:opacity-90" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="h-6 w-6 text-slate-200" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">{course.title}</h2>
                                    <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest">
                                        {course.chapters?.length || 0} chapters
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${course.isPublished
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-amber-50 text-amber-600"
                                    }`}>
                                    {course.isPublished ? "Live" : "Draft"}
                                </div>

                                {/* Edit Button */}
                                <Link href={`/instructor/courses/${course._id.toString()}`}>
                                    <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 h-12 w-12 p-0">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-28 bg-white rounded-[40px] border border-slate-100">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-10 w-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your studio is quiet...</h2>
                        <p className="text-slate-500 mt-3 mb-10 font-medium">Create your first course and start sharing your knowledge.</p>
                        <Link href="/instructor/courses/new">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 font-bold shadow-lg shadow-indigo-100">
                                <PlusCircle className="mr-2 h-5 w-5" /> Start Teaching
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}