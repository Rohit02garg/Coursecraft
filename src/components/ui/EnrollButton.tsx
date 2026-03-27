"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function EnrollButton({ courseId }: { courseId: string }) {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [isEnrolled, setIsEnrolled] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isEnrolling, setIsEnrolling] = useState(false)

    // Component mount hote hi check karo - kya user pehle se enrolled hai?
    useEffect(() => {
        const checkEnrollment = async () => {
            if (status === "authenticated") {
                try {
                    const response = await axios.get(`/api/courses/${courseId}/check-enrollment`)
                    setIsEnrolled(response.data.isEnrolled)
                } catch (error) {
                    console.error("Error checking enrollment", error)
                } finally {
                    setIsLoading(false)
                }
            } else if (status === "unauthenticated") {
                setIsLoading(false)
            }
        }
        checkEnrollment()
    }, [courseId, status])

    const handleEnroll = async () => {

        if (!session) {
            router.push("/sign-in")
            return
        }

        setIsEnrolling(true)
        try {
            await axios.post(`/api/courses/${courseId}/enroll`)
            toast.success("Enrolled!", { description: "Ab aap is course mein enrolled ho! Chalao!" })
            setIsEnrolled(true)
        } catch (error) {
            const axiosError = error as AxiosError<any>
            toast.error("Error", {
                description: axiosError.response?.data.message ?? "Enrollment mein error aaya"
            })
        } finally {
            setIsEnrolling(false)
        }
    }

    if (isLoading) {
        return <Button disabled className="w-full h-12 text-base rounded-xl"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking...</Button>
    }

    if (isEnrolled) {
        return (
            <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-12 text-base rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
                ✅ Already Enrolled — Go to Dashboard
            </Button>
        )
    }

    return (
        <Button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="w-full h-12 text-base rounded-xl bg-[#1A237E] hover:bg-[#2442AD] text-white shadow-md transition-all"
        >
            {isEnrolling ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enrolling...</>
            ) : (
                "Enroll Now — It's Free!"
            )}
        </Button>
    )
}