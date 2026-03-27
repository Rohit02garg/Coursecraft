"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2, CheckCircle2, Circle, ChevronLeft, PlayCircle, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

interface Chapter {
    _id: string
    title: string
    videoUrl: string
    content: string
}

interface CourseData {
    _id: string
    title: string
    chapters: Chapter[]
}

export default function LearnPage() {

    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string
    const [course, setCourse] = useState<CourseData | null>(null)

    // Abhi konsa chapter chal raha hai - pehle chapter se shuru
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)

    // Completed chapters ki list (IDs) - yeh DB se aayega
    const [completedChapters, setCompletedChapters] = useState<string[]>([])

    // Loading states
    const [isLoadingPage, setIsLoadingPage] = useState(true)
    const [isMarkingComplete, setIsMarkingComplete] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Page load hote hi course data aur progress fetch karo
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Teen API calls ek saath - fast!
                const [courseRes, enrollRes, progressRes] = await Promise.all([
                    axios.get(`/api/courses/${courseId}`),
                    axios.get(`/api/courses/${courseId}/check-enrollment`),
                    axios.get(`/api/courses/${courseId}/progress`)
                ])

                // Agar enrolled nahi hai toh course page pe bhej do
                if (!enrollRes.data.isEnrolled) {
                    toast.error("Access Denied", { description: "Enroll in this course first" })
                    router.push(`/courses/${courseId}`)
                    return
                }

                const fetchedCourse = courseRes.data.course
                setCourse(fetchedCourse)

                // Pehla chapter automatically select karo
                if (fetchedCourse.chapters?.length > 0) {
                    setActiveChapter(fetchedCourse.chapters[0])
                }

                // DB se completed chapters set karo - ab progress bar sahi se dikhega!
                const fetchedCompleted = progressRes.data.completedChapters ?? []
                setCompletedChapters(fetchedCompleted.map((id: any) => id.toString()))

            } catch (error) {
                console.error("Error fetching learning data", error)
                toast.error("Error", { description: "Course load nahi hua. Dobara try karo." })
            } finally {
                setIsLoadingPage(false)
            }
        }

        fetchData()
    }, [courseId, router])

    // Mark Complete / Uncomplete button ka handler
    const handleMarkComplete = async () => {
        if (!activeChapter) return

        const currentlyCompleted = completedChapters.includes(activeChapter._id)

        setIsMarkingComplete(true)
        try {
            await axios.post(`/api/courses/${courseId}/progress`, {
                chapterId: activeChapter._id,
                isCompleted: !currentlyCompleted  // toggle karo
            })

            // UI update karo locally - dobara API call ki zaroorat nahi
            if (currentlyCompleted) {
                setCompletedChapters(prev => prev.filter(id => id !== activeChapter._id))
                toast.success("Chapter un-marked!")
            } else {
                setCompletedChapters(prev => [...prev, activeChapter._id])
                toast.success("Chapter complete! 🎉", { description: "Badhiya kaam kiya!" })
            }

        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Progress save nahi hua"
            })
        } finally {
            setIsMarkingComplete(false)
        }
    }

    // Loading screen
    if (isLoadingPage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
                <p className="mt-4 text-white/70 font-medium">Loading your classroom...</p>
            </div>
        )
    }

    // Course nahi mila
    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                Course not found.
            </div>
        )
    }

    const isActiveChapterCompleted = activeChapter
        ? completedChapters.includes(activeChapter._id)
        : false

    const progressPercent = course.chapters.length > 0
        ? Math.round((completedChapters.length / course.chapters.length) * 100)
        : 0

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-white font-sans">

            {/* MOBILE TOP HEADER - Only visible on small screens */}
            <div className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-800 border-b border-slate-700 sticky top-0 z-[60] w-full">
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link href="/dashboard" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </div>
                <h2 className="font-bold text-sm truncate px-4 flex-1 text-center">
                    {course.title}
                </h2>
                <div className="w-10"></div> {/* Spacer to keep title centered */}
            </div>

            {/* MOBILE DRAWER OVERLAY & MENU */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="fixed inset-y-0 left-0 w-80 bg-slate-800 z-[80] md:hidden shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                                <h2 className="font-bold text-white uppercase tracking-wider text-xs">Course Content</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Reuse the Chapter Navigation Content */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                                {course.chapters.map((chapter, index) => {
                                    const isCompleted = completedChapters.includes(chapter._id)
                                    const isActive = activeChapter?._id === chapter._id

                                    return (
                                        <button
                                            key={chapter._id}
                                            onClick={() => {
                                                setActiveChapter(chapter)
                                                setIsMobileMenuOpen(false) // Mobile pe click karne pe menu band karo
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                                                ${isActive
                                                    ? "bg-white/10 text-white font-semibold"
                                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            {isCompleted
                                                ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                                : <Circle className="h-5 w-5 text-slate-600 shrink-0" />
                                            }
                                            <span className="text-sm">
                                                {index + 1}. {chapter.title}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="p-5 border-t border-slate-700">
                                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                    <span>Progress: {progressPercent}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* DESKTOP SIDEBAR - Chapters List */}
            <aside className="hidden md:flex flex-col w-72 bg-slate-800 border-r border-slate-700 h-screen sticky top-0 overflow-y-auto shrink-0">

                {/* Header */}
                <div className="p-5 border-b border-slate-700">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white mb-3 -ml-2 rounded-full">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Dashboard
                        </Button>
                    </Link>
                    <h2 className="font-bold text-white text-base line-clamp-2">{course.title}</h2>

                    {/* Progress Bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                            <span>{completedChapters.length}/{course.chapters.length} completed</span>
                            <span className="font-bold text-emerald-400">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Chapter List */}
                <nav className="flex-1 p-3 space-y-1">
                    {course.chapters.map((chapter, index) => {
                        const isCompleted = completedChapters.includes(chapter._id)
                        const isActive = activeChapter?._id === chapter._id

                        return (
                            <button
                                key={chapter._id}
                                onClick={() => {
                                    setActiveChapter(chapter)
                                    // Desktop pe menu band karne ki zaroorat nahi
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                                    ${isActive
                                        ? "bg-white/10 text-white font-semibold"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {/* Completed/incomplete icon */}
                                {isCompleted
                                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                    : <Circle className="h-5 w-5 text-slate-600 shrink-0" />
                                }
                                <span className="text-sm line-clamp-2">
                                    {index + 1}. {chapter.title}
                                </span>
                            </button>
                        )
                    })}
                </nav>
            </aside>

            {/* RIGHT - Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">

                {/* Video Player */}
                <div className="w-full bg-black aspect-video">
                    {activeChapter?.videoUrl ? (
                        // YouTube embed - user site pe hi rahega!
                        <iframe
                            key={activeChapter._id} // key change hone pe iframe reload hoga
                            src={activeChapter.videoUrl}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <PlayCircle className="h-16 w-16 mb-3" />
                            <p>No video available for this chapter</p>
                        </div>
                    )}
                </div>

                {/* Chapter Info & Actions */}
                <div className="p-6 md:p-10 max-w-4xl">

                    {/* Chapter Title + Mark Complete Button */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Now Playing</p>
                            <h1 className="text-2xl font-extrabold text-white">
                                {activeChapter?.title}
                            </h1>
                        </div>

                        <Button
                            onClick={handleMarkComplete}
                            disabled={isMarkingComplete}
                            className={`shrink-0 rounded-xl h-11 px-6 font-semibold transition-all ${isActiveChapterCompleted
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-white hover:bg-slate-100 text-slate-900"
                                }`}
                        >
                            {isMarkingComplete ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : isActiveChapterCompleted ? (
                                <><CheckCircle2 className="mr-2 h-4 w-4" /> Completed!</>
                            ) : (
                                "Mark as Complete"
                            )}
                        </Button>
                    </div>

                    {/* Chapter Content/Notes */}
                    {activeChapter?.content && (
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-lg font-bold text-white mb-3">Chapter Notes</h2>
                            <p className="text-slate-300 leading-relaxed">{activeChapter.content}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}