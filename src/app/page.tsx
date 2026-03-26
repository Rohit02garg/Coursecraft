"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* HEADER NAVBAR */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* LOGO */}
          <div className="bg-[#1A237E] p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">
            CourseCraft
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-gray-600 hover:text-[#1A237E] transition-colors"
          >
            Sign In
          </Link>
          <Link href="/sign-up">
            <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-5 py-2 sm:px-6 shadow-md transition-all">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 overflow-hidden relative">

        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32">

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8">
            Master new skills with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A237E] to-blue-500">
              CourseCraft
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Join thousands of students learning from the best instructors. Explore interactive courses, track your progress, and achieve your goals today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              {/* YOUR TURN: Test out these buttons! They should take you to your beautiful Sign Up page */}
              <Button size="lg" className="w-full h-14 px-8 text-lg font-semibold bg-[#2442AD] hover:bg-[#1A237E] rounded-full shadow-lg hover:shadow-xl transition-all">
                Start Learning Now
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg font-semibold rounded-full border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* HIGHLIGHTS SECTION */}
      <section id="features" className="w-full py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-[#1A237E]">
              Why choose CourseCraft?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="p-4 bg-blue-100 rounded-2xl shadow-sm">
                <BookOpen className="h-8 w-8 text-[#2442AD]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Diverse Courses</h3>
              <p className="text-gray-500 font-medium">Learn from a vast library of expert-led topics ranging from programming to design.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="p-4 bg-purple-100 rounded-2xl shadow-sm">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Community Driven</h3>
              <p className="text-gray-500 font-medium">Connect with instructors and peers to ask questions and share your knowledge.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="p-4 bg-emerald-100 rounded-2xl shadow-sm">
                <Trophy className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Earn Certificates</h3>
              <p className="text-gray-500 font-medium">Complete courses and earn certificates to showcase your new skills to employers.</p>
            </div>
          </div>
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