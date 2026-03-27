"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2, ChevronLeft, BookOpen, Video, Users, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

const perks = [
    {
        icon: Video,
        title: "Create Courses",
        desc: "Upload chapters with YouTube videos and notes"
    },
    {
        icon: Users,
        title: "Reach Students",
        desc: "Your course appears publicly in the catalog for everyone"
    },
    {
        icon: BadgeCheck,
        title: "Free Forever",
        desc: "No fees, no hidden charges. Teaching is completely free"
    },
    {
        icon: BookOpen,
        title: "Full Control",
        desc: "Publish, manage, and update your courses anytime"
    }
]

export default function BecomeInstructorPage() {

    const { data: session } = useSession()
    const router = useRouter()
    const [isUpgrading, setIsUpgrading] = useState(false)

    // Agar pehle se instructor hai toh seedha studio pe le jao
    // useEffect mein karo - render ke time pe router.push nahi chalega
    useEffect(() => {
        if (session?.user?.role === "INSTRUCTOR") {
            router.push("/instructor")
        }
    }, [session, router])

    const handleBecomeInstructor = async () => {
        setIsUpgrading(true)
        try {
            await axios.post("/api/become-instructor")

            toast.success("🎉 You're now an Instructor!", {
                description: "Logging you out to refresh your session..."
            })

            // JWT refresh ke liye re-login zaroori hai
            // 1.5 second baad signOut karo taaki toast dikh sake
            setTimeout(() => {
                signOut({ callbackUrl: "/sign-in" })
            }, 1500)

        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Upgrade failed. Try again."
            })
            setIsUpgrading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D1033] via-[#1A237E] to-[#1565C0] font-sans flex flex-col">

            {/* Back Button */}
            <div className="p-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* HERO */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12 text-center">

                <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 mb-6 backdrop-blur-sm">
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    Join 1000+ instructors on CourseCraft
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white max-w-2xl leading-tight">
                    Share Your Knowledge.{" "}
                    <span className="text-emerald-400">Inspire Students.</span>
                </h1>

                <p className="text-white/60 mt-6 max-w-lg text-lg leading-relaxed">
                    Become an instructor and create courses that thousands of students will learn from.
                    It's free, simple, and powerful.
                </p>

                {/* Perks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 max-w-2xl w-full">
                    {perks.map((perk) => (
                        <div
                            key={perk.title}
                            className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 text-left backdrop-blur-sm"
                        >
                            <div className="h-10 w-10 bg-emerald-400/10 rounded-xl flex items-center justify-center shrink-0">
                                <perk.icon className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{perk.title}</p>
                                <p className="text-white/50 text-xs mt-0.5">{perk.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <Button
                    onClick={handleBecomeInstructor}
                    disabled={isUpgrading}
                    className="mt-10 h-14 px-10 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl shadow-2xl shadow-emerald-900/50 transition-all hover:scale-105"
                >
                    {isUpgrading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Upgrading your account...</>
                    ) : (
                        "Start Teaching — It's Free! 🚀"
                    )}
                </Button>

                {/* Re-login notice */}
                <p className="text-white/30 text-xs mt-4 max-w-sm">
                    After upgrading, you'll be logged out once to refresh your session, then log back in to access Instructor Studio.
                </p>
            </div>
        </div>
    )
}
