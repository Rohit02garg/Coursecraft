"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Compass, PlayCircle, PlusCircle, Search, LogOut, Monitor, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Type definition for our new dynamically fetched data
interface EnrolledCourse {
    id: string;
    title: string;
    instructor: string;
    progress: number;
    thumbnail: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();

    // State to hold real data!
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");  // Issue #6 - search state

    useEffect(() => {
        const fetchEnrollments = async () => {
            if (status === "authenticated") {
                try {
                    const response = await axios.get("/api/user/enrollments");
                    if (response.data.success) {
                        setEnrolledCourses(response.data.enrollments);
                    }
                } catch (error) {
                    console.error("Failed to fetch enrollments", error);
                    toast.error("Error", { description: "Could not load your courses." });
                } finally {
                    setIsLoadingData(false);
                }
            }
        };

        fetchEnrollments();
    }, [status]);

    // Filter logic outside JSX for better readability and to fix name error
    const filteredCourses = enrolledCourses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === "loading" || (status === "authenticated" && isLoadingData)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading your portal...</p>
            </div>
        );
    }

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
                <div className="h-16 flex items-center px-8 border-b border-slate-100">
                    <span className="font-bold text-xl text-slate-900 tracking-tight">CourseCraft</span>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-slate-100/80 text-indigo-600 rounded-xl font-bold shadow-sm text-sm">
                        <BookOpen className="h-4 w-4" />
                        My Learning
                    </Link>
                    <Link href="/courses" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold transition-colors text-sm">
                        <Compass className="h-4 w-4" />
                        Explore
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold transition-colors text-sm">
                        <UserIcon className="h-4 w-4" />
                        Profile
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-2">
                    {/* Issue #3 - Role-based button */}
                    {session?.user?.role === "INSTRUCTOR" ? (
                        <Link href="/instructor">
                            <Button variant="outline" className="w-full justify-start text-indigo-600 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/30 transition-colors shadow-none rounded-xl text-xs font-bold py-5">
                                <Monitor className="mr-2 h-4 w-4" />
                                Instructor Studio
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/become-instructor">
                            <Button variant="outline" className="w-full justify-start text-indigo-600 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/30 transition-colors shadow-none rounded-xl text-xs font-bold py-5">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Teach on CourseCraft
                            </Button>
                        </Link>
                    )}
                    <Button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        variant="outline"
                        className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50 hover:border-red-400 transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto w-full">
                <div className="flex items-center justify-between mb-12">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 bg-white border-slate-200 rounded-xl shadow-none focus-visible:ring-indigo-600 text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-full text-indigo-600 flex items-center justify-center font-bold">
                            {session?.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </div>
                </div>

                {/* WELCOME SECTION */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back, <span className="text-indigo-600">{session?.user?.username || "Student"}</span>.
                        </h1>
                        <p className="text-slate-500 mt-2 text-base font-medium">Continue where you left off.</p>
                    </div>

                    <div className="flex gap-8 bg-white p-6 rounded-2xl border border-slate-100">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-slate-900">{enrolledCourses.length}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Enrolled</span>
                        </div>
                        <div className="w-px bg-slate-100"></div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-indigo-600">
                                {enrolledCourses.filter(c => c.progress === 100).length}
                            </span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Completed</span>
                        </div>
                    </div>
                </header>

                {/* ENROLLED COURSES GRID */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all duration-300 group flex flex-col">
                                <div className="h-48 bg-slate-50 relative overflow-hidden shrink-0 border-b border-slate-50">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90" />
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">{course.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1.5 font-bold uppercase tracking-wider">{course.instructor}</p>

                                    <div className="mt-auto pt-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{course.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                                        </div>

                                        <Link href={`/learn/${course.id}`}>
                                            <Button className="w-full mt-6 bg-slate-900 hover:bg-black text-white rounded-2xl h-12 text-sm font-bold transition-all shadow-sm">
                                                Continue
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchQuery ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Search className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No courses found</h3>
                        <p className="text-slate-500 mt-2">Try searching for something else.</p>
                    </div>
                ) : (
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