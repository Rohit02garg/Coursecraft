"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2, ChevronLeft, PlusCircle, Trash2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    description: string
    thumbnail: string
    isPublished: boolean
    chapters: Chapter[]
}

export default function CourseEditorPage() {

    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<CourseData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPublishing, setIsPublishing] = useState(false)

    // Naye chapter ka form state
    const [chapterTitle, setChapterTitle] = useState("")
    const [chapterVideo, setChapterVideo] = useState("")
    const [chapterContent, setChapterContent] = useState("")
    const [isAddingChapter, setIsAddingChapter] = useState(false)
    const [showChapterForm, setShowChapterForm] = useState(false)

    // Course fetch karo
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/courses/${courseId}`)
                setCourse(response.data.course)
            } catch (error) {
                console.error("Error fetching course", error)
                toast.error("Error", { description: "Course load nahi hua" })
            } finally {
                setIsLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])

    // Chapter add karo
    const handleAddChapter = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsAddingChapter(true)
        try {
            await axios.post(`/api/courses/${courseId}/chapters`, {
                title: chapterTitle,
                videoUrl: chapterVideo,
                content: chapterContent,
                isFree: false
            })

            toast.success("Chapter Added! 🎉")

            // Form reset karo aur course dobara fetch karo
            setChapterTitle("")
            setChapterVideo("")
            setChapterContent("")
            setShowChapterForm(false)

            // Fresh data lo - naya chapter dikhega
            const response = await axios.get(`/api/courses/${courseId}`)
            setCourse(response.data.course)

        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Chapter add nahi hua"
            })
        } finally {
            setIsAddingChapter(false)
        }
    }

    // Chapter delete karo
    const handleDeleteChapter = async (chapterId: string) => {
        try {
            await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`)
            toast.success("Chapter deleted")
            // UI se hata do locally - fast response
            setCourse(prev => prev
                ? { ...prev, chapters: prev.chapters.filter(c => c._id !== chapterId) }
                : null
            )
        } catch (error) {
            toast.error("Error", { description: "Chapter delete nahi hua" })
        }
    }

    // Course publish karo
    const handlePublish = async () => {
        setIsPublishing(true)
        try {
            await axios.post(`/api/courses/${courseId}/publish`)
            toast.success("Course Published! 🚀", { description: "Ab yeh public catalog mein dikhega!" })
            setCourse(prev => prev ? { ...prev, isPublished: true } : null)
        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Cannot Publish", {
                description: axiosError.response?.data.message ?? "Publish nahi hua"
            })
        } finally {
            setIsPublishing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-[#1A237E]" />
            </div>
        )
    }

    if (!course) return null

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/instructor">
                            <Button variant="ghost" size="sm" className="rounded-full text-slate-500 hover:text-[#1A237E] shrink-0">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="font-extrabold text-[#1A237E] truncate text-xl">{course.title}</h1>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                }`}>
                                {course.isPublished ? "Published" : "Draft"}
                            </span>
                        </div>
                    </div>

                    {/* Publish Button - sirf tab dikhao jab published nahi hai */}
                    {!course.isPublished && (
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing || course.chapters.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shrink-0"
                        >
                            {isPublishing
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                                : <><Globe className="mr-2 h-4 w-4" /> Publish Course</>
                            }
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* CHAPTERS SECTION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Chapters ({course.chapters.length})
                        </h2>
                        <Button
                            onClick={() => setShowChapterForm(!showChapterForm)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 hover:border-[#1A237E] hover:text-[#1A237E]"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Chapter
                        </Button>
                    </div>

                    {/* Chapter Add Form - toggle hota hai */}
                    {showChapterForm && (
                        <form onSubmit={handleAddChapter} className="bg-slate-50 rounded-xl p-5 mb-6 space-y-4 border border-slate-200">
                            <h3 className="font-semibold text-slate-700">New Chapter</h3>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Chapter Title *</label>
                                <Input
                                    placeholder="e.g. Introduction to Variables"
                                    value={chapterTitle}
                                    onChange={e => setChapterTitle(e.target.value)}
                                    className="h-10 rounded-lg border-slate-200 focus-visible:ring-[#1A237E]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">YouTube Embed URL *</label>
                                <Input
                                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                    value={chapterVideo}
                                    onChange={e => setChapterVideo(e.target.value)}
                                    className="h-10 rounded-lg border-slate-200 focus-visible:ring-[#1A237E]"
                                    required
                                />
                                <p className="text-xs text-slate-400">
                                    ⚠️ /embed/ URL use karo, /watch?v= nahi!
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Chapter Notes *</label>
                                <textarea
                                    placeholder="Chapter ke baare mein kuch likho..."
                                    value={chapterContent}
                                    onChange={e => setChapterContent(e.target.value)}
                                    rows={3}
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E] resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isAddingChapter}
                                    className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-lg"
                                >
                                    {isAddingChapter
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                                        : "Add Chapter"
                                    }
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowChapterForm(false)}
                                    className="rounded-lg text-slate-500"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Chapters List */}
                    {course.chapters.length > 0 ? (
                        <div className="space-y-3">
                            {course.chapters.map((chapter, index) => (
                                <div
                                    key={chapter._id}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                    <div className="h-8 w-8 bg-[#1A237E]/10 rounded-full flex items-center justify-center text-[#1A237E] font-bold text-sm shrink-0">
                                        {index + 1}
                                    </div>
                                    <p className="flex-1 font-medium text-slate-800 text-sm">{chapter.title}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteChapter(chapter._id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8 text-sm">
                            Abhi koi chapter nahi hai. "Add Chapter" pe click karo!
                        </p>
                    )}

                    {/* Publish hint */}
                    {course.chapters.length === 0 && !course.isPublished && (
                        <p className="text-center text-amber-600 text-xs mt-2 font-medium">
                            ⚠️ Publish karne ke liye kam se kam 1 chapter zaroori hai
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}