import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react";

// For auth detection
import { auth } from "@/auth";

// Our Database Imports!
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";

// Our new Component from Cheat Code #7!
import CourseCard from "@/components/ui/CourseCard";

// NOTE: No "use client" anymore! 
// This makes it a powerful Server Component. Wait until you see how fast this fetches!

export default async function Home() {
  // 1. Fetch Session (To conditionally show "Dashboard" vs "Sign In")
  const session = await auth();

  // 2. Fetch Courses from Database (Server-side rendering!)
  await dbConnect();

  // Notice we only fetch PUBLISHED courses!
  const courses = await CourseModel.find({ isPublished: true })
    .populate("instructor", "username email")
    .sort({ createdAt: -1 })
    // Limit to 6 for the landing page grid so we don't overwhelm users
    .limit(6)
    .lean(); // .lean() makes the query faster and returns pure JS objects

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* HEADER NAVBAR */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#1A237E] p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">
            CourseCraft
          </span>
        </div>

        {/* Navigation - Conditionally Rendered based on Auth! */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link href="#courses-section" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-[#1A237E] transition-colors">
            Explore Courses
          </Link>

          {session ? (
            <Link href="/dashboard">
              <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-5 py-2 sm:px-6 shadow-md transition-all">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-semibold text-gray-600 hover:text-[#1A237E] transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-5 py-2 sm:px-6 shadow-md transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8">
            Master new skills with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A237E] to-blue-500">
              CourseCraft
            </span>
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Join thousands of students learning from the best instructors. Explore interactive courses, track your progress, and achieve your goals today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#courses-section">
              <Button size="lg" className="w-full h-14 px-8 text-lg font-semibold bg-[#2442AD] hover:bg-[#1A237E] rounded-full shadow-lg transition-all">
                Explore The Catalog
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* DYNAMIC PUBLIC COURSES GRID SECTION */}
      <section id="courses-section" className="w-full py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1A237E] sm:text-4xl">
                Featured Courses
              </h2>
              <p className="mt-4 text-lg text-gray-500 font-medium">
                Start your journey with our top-rated courses without signing up!
              </p>
            </div>

            {/* 
              Future Upgrade: A dedicated `/courses` catalog page! 
              For now we just link out showing intent.
            */}
            <Link href="/courses">
              <Button variant="ghost" className="text-[#1A237E] font-bold hover:bg-blue-50 rounded-full hidden sm:flex">
                View All Courses <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => {
                // Safely extract the instructor's username or fallback to email
                const instId = course.instructor;
                const instructorName = typeof instId === 'object' && instId !== null
                  ? (instId.username || instId.email || 'Instructor')
                  : 'Instructor';

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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-600">No courses available yet</h3>
              <p className="text-slate-500 mt-2">Instructors are working on amazing content!</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-10 text-center">
        <p className="text-slate-400 font-medium tracking-wide text-sm">
          © {new Date().getFullYear()} CourseCraft. All rights reserved.
        </p>
      </footer>
    </div>
  );
}