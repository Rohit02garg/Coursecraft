"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { User, Mail, Shield, ChevronLeft, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
    const { data: session } = useSession()
    const user = session?.user

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#1A237E] rounded-full mb-8">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Button>
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header/Cover Color */}
                    <div className="h-32 bg-gradient-to-r from-[#1A237E] to-[#2442AD]"></div>

                    <div className="px-8 pb-12">
                        {/* Avatar */}
                        <div className="relative -mt-12 mb-6">
                            <div className="h-24 w-24 bg-white rounded-full p-2 shadow-lg">
                                <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center text-[#1A237E] text-3xl font-black border-2 border-slate-50">
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                {user?.username || "Learner"}
                            </h1>
                            <p className="text-slate-500 font-medium">Manage your account settings and profile</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-[#1A237E]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</p>
                                    <p className="font-bold text-slate-900 truncate">{user?.username || "Not set"}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                    <p className="font-bold text-slate-900 truncate">{user?.email || "Not set"}</p>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
                                    <p className="font-bold text-slate-900 truncate">{user?.role || "STUDENT"}</p>
                                </div>
                            </div>

                            {/* Joined Date (Mock) */}
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Calendar className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                    <p className="font-bold text-slate-900">Active Account</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Stats Section */}
                        <div className="mt-10 p-8 rounded-3xl bg-[#1A237E] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/20">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                    <BookOpen className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Your Impact</p>
                                    <p className="text-2xl font-black">Keep learning daily!</p>
                                </div>
                            </div>
                            <Link href="/courses">
                                <Button className="bg-white text-[#1A237E] hover:bg-white/90 rounded-2xl px-10 h-14 font-bold shadow-lg transition-transform hover:scale-105 shrink-0">
                                    Explore More Courses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
