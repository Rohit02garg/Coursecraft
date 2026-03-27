"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { User, Mail, Shield, ChevronLeft, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
    const { data: session } = useSession()
    const user = session?.user

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-14">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link href="/dashboard" className="inline-block mb-10 ml-2">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center transition-colors">
                        <ChevronLeft className="h-3 w-3 mr-1" /> Dashboard
                    </button>
                </Link>

                <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                    {/* Header/Cover Color */}
                    <div className="h-40 bg-slate-900 border-b border-indigo-500/10"></div>

                    <div className="px-10 pb-16">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-10 flex justify-center md:justify-start">
                            <div className="h-32 w-32 bg-white rounded-full p-2 border border-slate-50 shadow-sm">
                                <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold">
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="mb-12 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                {user?.username || "Learner"}
                            </h1>
                            <p className="text-slate-400 mt-3 font-bold text-xs uppercase tracking-[0.2em]">{user?.role || "STUDENT"}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Username */}
                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center gap-6">
                                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100/50">
                                    <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Username</p>
                                    <p className="font-bold text-slate-900 truncate">{user?.username || "Not set"}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center gap-6">
                                <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/50">
                                    <Mail className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="font-bold text-slate-900 truncate">{user?.email || "Not set"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Stats Section */}
                        <div className="mt-12 p-10 rounded-[40px] bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                                    <BookOpen className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Learning Pulse</p>
                                    <p className="text-2xl font-bold tracking-tight leading-tight">Your daily streak is active!</p>
                                </div>
                            </div>
                            <Link href="/courses">
                                <Button className="bg-white text-slate-950 hover:bg-slate-100 rounded-2xl px-12 h-14 font-bold transition-all shrink-0 shadow-xl shadow-white/5">
                                    More Courses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
