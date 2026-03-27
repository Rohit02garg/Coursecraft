"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function NewCoursePage() {

    const router = useRouter()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await axios.post("/api/courses", {
                title,
                description,
                thumbnail,
                isPublished: false,
                chapters: []  // Blank course banate hain, chapters baad mein add karenge
            })

            toast.success("Course Created!", { description: "Ab chapters add karo!" })

            // Created course ke editor pe le jao seedha
            const newCourseId = response.data.course._id
            router.push(`/instructor/courses/${newCourseId}`)

        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Course create nahi hua"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            <div className="max-w-2xl mx-auto px-4 py-12">

                {/* Back Link */}
                <Link href="/instructor">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#1A237E] rounded-full mb-6 -ml-2">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Studio
                    </Button>
                </Link>

                <h1 className="text-3xl font-extrabold text-[#1A237E] mb-2">Create New Course</h1>
                <p className="text-slate-500 mb-8">Start with the basics. You can add chapters in the next step.</p>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Course Title *</label>
                        <Input
                            placeholder="e.g. Complete JavaScript Course 2024"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 focus-visible:ring-[#1A237E]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Description *</label>
                        <textarea
                            placeholder="What will students learn in this course?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E] resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Thumbnail URL *</label>
                        <Input
                            placeholder="https://example.com/image.jpg"
                            value={thumbnail}
                            onChange={e => setThumbnail(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 focus-visible:ring-[#1A237E]"
                            required
                        />
                        <p className="text-xs text-slate-400">Koi bhi image ka direct URL paste karo (Unsplash, etc.)</p>
                    </div>

                    {/* Thumbnail Preview */}
                    {thumbnail && (
                        <div className="h-40 bg-slate-100 rounded-xl overflow-hidden">
                            <img src={thumbnail} alt="preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-xl text-base font-semibold shadow-md"
                    >
                        {isSubmitting
                            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
                            : "Create Course & Add Chapters →"
                        }
                    </Button>
                </form>
            </div>
        </div>
    )
}