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
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A237E]">
                            Instructor Studio
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {courses.length} {courses.length === 1 ? "course" : "courses"} created
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/instructor/courses/new">
                            <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-xl shadow-md">
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
                    <div className="space-y-4">
                        {courses.map((course: any) => (
                            <div
                                key={course._id.toString()}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="h-16 w-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="h-6 w-6 text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-slate-900 truncate">{course.title}</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {course.chapters?.length || 0} chapters
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${course.isPublished
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}>
                                    {course.isPublished
                                        ? <><Eye className="h-3.5 w-3.5" /> Published</>
                                        : <><EyeOff className="h-3.5 w-3.5" /> Draft</>
                                    }
                                </div>

                                {/* Edit Button */}
                                <Link href={`/instructor/courses/${course._id.toString()}`}>
                                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:border-[#1A237E] hover:text-[#1A237E]">
                                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">No courses yet</h2>
                        <p className="text-slate-500 mt-2 mb-8">Create your first course and start teaching!</p>
                        <Link href="/instructor/courses/new">
                            <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-8">
                                <PlusCircle className="mr-2 h-4 w-4" /> Create First Course
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}