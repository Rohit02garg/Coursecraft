"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Compass, User as UserIcon, LogOut, PlayCircle, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Dummy data for our UI so we can see the layout!
const dummyEnrolledCourses = [
    { id: "1", title: "Advanced React Patterns", instructor: "Hitesh Choudhary", progress: 45, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop" },
    { id: "2", title: "Next.js 15 Masterclass", instructor: "Hitesh Choudhary", progress: 12, thumbnail: "https://images.unsplash.com/photo-1627398225056-ee1a03e61f23?q=80&w=800&auto=format&fit=crop" }
];

export default function DashboardPage() {
    const { data: session, status } = useSession();

    // Show a nice loading state while checking auth
    if (status === "loading") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E]"></div>
                <p className="mt-4 text-[#1A237E] font-medium">Loading your portal...</p>
            </div>
        );
    }

    // If not authenticated, the Next.js middleware should kick them to sign-in, but just in case:
    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">
                Access Denied. Please Sign In.
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">

            {/* SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm fixed h-full z-10">
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">CourseCraft</span>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#1A237E] rounded-xl font-semibold shadow-sm">
                        <BookOpen className="h-5 w-5" />
                        My Learning
                    </Link>
                    <Link href="/courses" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <Compass className="h-5 w-5" />
                        Explore Courses
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <UserIcon className="h-5 w-5" />
                        Profile
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {/* Become Instructor CTA */}
                    <Link href="/become-instructor">
                        <Button variant="outline" className="w-full justify-start text-[#1A237E] border-slate-300 hover:border-[#1A237E] hover:bg-blue-50 transition-colors shadow-sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Teach on CourseCraft
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto w-full">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">

                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search your courses..."
                            className="pl-10 h-11 bg-white border-slate-200 rounded-full shadow-sm focus-visible:ring-[#1A237E]"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center font-bold shadow-md">
                            {session?.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </div>
                </div>

                {/* WELCOME SECTION */}
                <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                            Welcome back, <span className="text-[#1A237E]">{session?.user?.username || "Student"}</span>! 👋
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Pick up right where you left off.</p>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="flex gap-4 sm:gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="px-4 text-center">
                            <span className="block text-2xl font-bold text-[#1A237E]">{dummyEnrolledCourses.length}</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Courses</span>
                        </div>
                        <div className="w-px bg-slate-200"></div>
                        <div className="px-4 text-center">
                            <span className="block text-2xl font-bold text-emerald-600">0</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed</span>
                        </div>
                    </div>
                </header>

                {/* ENROLLED COURSES GRID */}
                {dummyEnrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dummyEnrolledCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col">

                                {/* Thumbnail */}
                                <div className="h-44 bg-slate-200 relative overflow-hidden shrink-0">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-[#1A237E]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle className="text-white h-14 w-14 drop-shadow-lg" />
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">{course.instructor}</p>

                                    {/* Progress Bar (Pushed to bottom using mt-auto) */}
                                    <div className="mt-auto pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-[#1A237E] rounded-full" style={{ width: `${course.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-[#1A237E]">{course.progress}%</span>
                                        </div>

                                        <Link href={`/learn/${course.id}`}>
                                            <Button className="w-full mt-4 bg-slate-900 hover:bg-[#1A237E] text-white rounded-xl shadow-md transition-all">
                                                Continue Learning
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* EMPTY STATE (If they have no courses) */
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Compass className="h-12 w-12 text-[#1A237E]" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Your learning journey awaits!</h3>
                        <p className="text-slate-500 mt-3 max-w-md text-center text-lg">You haven't enrolled in any courses yet. Explore our catalog and discover something amazing to learn today.</p>
                        <Link href="/courses" className="mt-8">
                            <Button size="lg" className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-10 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                                Explore The Catalog
                            </Button>
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}