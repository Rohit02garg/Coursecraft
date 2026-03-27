"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2, ChevronLeft, PlusCircle, Trash2, Globe, Settings2 } from "lucide-react"
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

    // Course Edit form state
    const [showEditForm, setShowEditForm] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editThumbnail, setEditThumbnail] = useState("")
    const [isUpdatingCourse, setIsUpdatingCourse] = useState(false)

    // Course fetch karo
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/courses/${courseId}`)
                const fetchedCourse = response.data.course
                setCourse(fetchedCourse)

                // Populate edit states so it's ready for editing
                setEditTitle(fetchedCourse.title)
                setEditDescription(fetchedCourse.description)
                setEditThumbnail(fetchedCourse.thumbnail)
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

    // Toggle Publish State (Unpublish)
    const handleUnpublish = async () => {
        setIsPublishing(true)
        try {
            await axios.patch(`/api/courses/${courseId}`, {
                isPublished: false
            })
            toast.success("Course Unpublished", { description: "Is ab catalog se hata diya gaya hai." })
            setCourse(prev => prev ? { ...prev, isPublished: false } : null)
        } catch (error) {
            toast.error("Action Failed", { description: "Unpublish nahi hua" })
        } finally {
            setIsPublishing(false)
        }
    }

    // Delete entire course
    const handleDeleteCourse = async () => {
        if (!window.confirm("ARE YOU SURE? This will permanently delete this course and all its chapters!")) return

        try {
            await axios.delete(`/api/courses/${courseId}`)
            toast.success("Course Deleted Forever")
            router.push("/instructor")
        } catch (error) {
            toast.error("Error", { description: "Delete karne mein error aaya" })
        }
    }

    // Course update handler
    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdatingCourse(true)
        try {
            const response = await axios.patch(`/api/courses/${courseId}`, {
                title: editTitle,
                description: editDescription,
                thumbnail: editThumbnail
            })

            toast.success("Course Updated! ✨")
            setCourse(response.data.course)
            setShowEditForm(false)
        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Update Failed", {
                description: axiosError.response?.data.message ?? "Update nahi hua"
            })
        } finally {
            setIsUpdatingCourse(false)
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
                            <h1 className="font-bold text-slate-900 truncate text-lg tracking-tight">{course.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${course.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    }`}>
                                    {course.isPublished ? "Live" : "Draft"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowEditForm(!showEditForm)}
                            variant="ghost"
                            className="rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                        >
                            <Settings2 className="mr-2 h-4 w-4" />
                            {showEditForm ? "Cancel" : "Edit Info"}
                        </Button>

                        {/* Unpublish Button - sirf tab dikhao jab published hai */}
                        {course.isPublished && (
                            <Button
                                onClick={handleUnpublish}
                                disabled={isPublishing}
                                variant="ghost"
                                className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl px-5 h-10 font-bold text-xs shrink-0"
                            >
                                {isPublishing
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ...</>
                                    : <><Globe className="mr-2 h-4 w-4" /> Unpublish</>
                                }
                            </Button>
                        )}

                        {/* Publish Button */}
                        {!course.isPublished && (
                            <Button
                                onClick={handlePublish}
                                disabled={isPublishing || course.chapters.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 font-bold text-xs shadow-sm shrink-0"
                            >
                                {isPublishing
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ...</>
                                    : <><Globe className="mr-2 h-4 w-4" /> Publish</>
                                }
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* EDIT COURSE DETAILS FORM */}
                {showEditForm && (
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-indigo-600" /> Update Metadata
                        </h2>
                        <form onSubmit={handleUpdateCourse} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Title</label>
                                    <Input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 focus:ring-[#1A237E]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thumbnail URL</label>
                                    <Input
                                        value={editThumbnail}
                                        onChange={e => setEditThumbnail(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 focus:ring-[#1A237E]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E] resize-none"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowEditForm(false)}
                                    className="rounded-xl text-slate-500"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUpdatingCourse}
                                    className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-xl px-10 h-12 shadow-lg"
                                >
                                    {isUpdatingCourse
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                                        : "Save Changes"
                                    }
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CHAPTERS SECTION */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            Curriculum <span className="text-slate-400 font-medium ml-2">({course.chapters.length})</span>
                        </h2>
                        <Button
                            onClick={() => setShowChapterForm(!showChapterForm)}
                            className="rounded-xl bg-slate-900 hover:bg-black text-white px-6 font-bold text-xs h-10 shadow-sm"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Chapter
                        </Button>
                    </div>

                    {/* Chapter Add Form - toggle hota hai */}
                    {showChapterForm && (
                        <form onSubmit={handleAddChapter} className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-4 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">New Chapter</h3>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                                <Input
                                    placeholder="e.g. Introduction to Variables"
                                    value={chapterTitle}
                                    onChange={e => setChapterTitle(e.target.value)}
                                    className="h-11 rounded-xl border-slate-100 focus-visible:ring-indigo-600 bg-white"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video URL</label>
                                <Input
                                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                    value={chapterVideo}
                                    onChange={e => setChapterVideo(e.target.value)}
                                    className="h-11 rounded-xl border-slate-100 focus-visible:ring-indigo-600 bg-white"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Use the YouTube /embed/ URL format.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                                <textarea
                                    placeholder="Chapter notes..."
                                    value={chapterContent}
                                    onChange={e => setChapterContent(e.target.value)}
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={isAddingChapter}
                                    className="bg-slate-900 hover:bg-black text-white rounded-xl px-6 h-11 font-bold text-xs"
                                >
                                    {isAddingChapter
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                                        : "Create Chapter"
                                    }
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowChapterForm(false)}
                                    className="rounded-xl text-slate-400 h-11"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Chapters List */}
                    {course.chapters.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {course.chapters.map((chapter, index) => (
                                <div
                                    key={chapter._id}
                                    className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:border-indigo-100 transition-all"
                                >
                                    <div className="h-8 w-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0">
                                        {index + 1}
                                    </div>
                                    <p className="flex-1 font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{chapter.title}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteChapter(chapter._id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0 h-10 w-10 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm text-slate-400 font-medium italic">
                                No chapters yet. Click "Add Chapter" to build your curriculum.
                            </p>
                        </div>
                    )}

                    {/* Publish hint */}
                    {course.chapters.length === 0 && !course.isPublished && (
                        <p className="text-center text-amber-600 text-xs mt-2 font-medium">
                            ⚠️ Publish karne ke liye kam se kam 1 chapter zaroori hai
                        </p>
                    )}
                </div>

                {/* DANGER ZONE - Refined & Subtle */}
                <div className="mt-20 pt-12 border-t border-slate-100">
                    <div className="bg-white border border-slate-100 rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-lg font-bold text-slate-900 mb-2">Danger Zone</h2>
                            <p className="text-sm text-slate-400 font-medium max-w-md">Remove this course and all its data. This action is irreversible.</p>
                        </div>
                        <Button
                            onClick={handleDeleteCourse}
                            variant="ghost"
                            className="rounded-2xl px-10 h-14 font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}