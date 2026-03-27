# CourseCraft Cheat Codes
*Style: Chai aur Code (MysteryMessage Format)*

---

## Cheat Code #6: Dynamic Student Dashboard (`api/user/enrollments` & `dashboard/page.tsx`)

### Hooking up the Matrix
Now that your glorious backend APIs are built, let's tie them into the Frontend Dashboard you created in Phase 1! We need a simple API to fetch what courses the logged-in student is actually enrolled in.

### Step 1: The API Route (`app/api/user/enrollments/route.ts`)
Create the folders and file `src/app/api/user/enrollments/route.ts` and paste this code:

```typescript
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import CourseProgressModel from "@/model/CourseProgress";

export async function GET(request: Request) {

    await dbConnect()

    try {

        const session = await auth()
        const user = session?.user

        if (!user || !session) {
            console.error("Unauthorised")
            return NextResponse.json({
                success: false,
                message: "Unauthorised"
            },
                {
                    status: 401
                }
            )
        }

        const userInDB = await UserModel.findById(user._id)
            .populate("enrolledCourses", "title description thumbnail instructor chapters")

        if (!userInDB) {
            console.error("User not found")
            return NextResponse.json({
                success: false,
                message: "User not found"
            },
                {
                    status: 404
                }
            )
        }

        // For each enrolled course, attach their progress percentage
        const enrollments = []

        for (const course of userInDB.enrolledCourses as any[]) {

            const progress = await CourseProgressModel.findOne({
                userId: user._id,
                courseId: course._id
            })

            const totalChapters = course.chapters ? course.chapters.length : 0
            const completedCount = progress ? progress.completedChapters.length : 0
            const progressPercentage = totalChapters === 0 ? 0 : Math.round((completedCount / totalChapters) * 100)

            enrollments.push({
                id: course._id,
                title: course.title,
                instructor: course.instructor?.username || "Unknown",
                thumbnail: course.thumbnail,
                progress: progressPercentage
            })
        }

        return NextResponse.json({
            success: true,
            message: "Enrollments fetched successfully",
            enrollments
        },
            {
                status: 200
            }
        )

    } catch (error) {

        console.error("Error fetching enrollments", error)
        return NextResponse.json({
            success: false,
            message: "Error fetching enrollments"
        },
            {
                status: 500
            }
        )

    }

}
```
### Step 2: Empowering the Dashboard (`app/(auth)/dashboard/page.tsx`)
Now we hook this new data source into your beautiful Dashboard UI.
Open `src/app/(auth)/dashboard/page.tsx` and **REPLACE** the entire file with this dynamic version:

```tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Compass, User as UserIcon, PlayCircle, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Type definition for our new dynamically fetched data
interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    
    // State to hold real data!
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchEnrollments = async () => {
            if (status === "authenticated") {
                try {
                    const response = await axios.get("/api/user/enrollments");
                    if (response.data.success) {
                        setEnrolledCourses(response.data.enrollments);
                    }
                } catch (error) {
                    console.error("Failed to fetch enrollments", error);
                    toast.error("Error", { description: "Could not load your courses." });
                } finally {
                    setIsLoadingData(false);
                }
            }
        };

        fetchEnrollments();
    }, [status]);

    if (status === "loading" || (status === "authenticated" && isLoadingData)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E]"></div>
                <p className="mt-4 text-[#1A237E] font-medium">Loading your portal...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">
                Access Denied. Please Sign In.
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm fixed h-full z-10">
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">CourseCraft</span>
                </div>
                
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#1A237E] rounded-xl font-semibold shadow-sm">
                        <BookOpen className="h-5 w-5" />
                        My Learning
                    </Link>
                    <Link href="/courses" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <Compass className="h-5 w-5" />
                        Explore Courses
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                        <UserIcon className="h-5 w-5" />
                        Profile
                    </Link>
                </nav>
                
                <div className="p-4 border-t border-slate-100">
                    <Link href="/become-instructor">
                        <Button variant="outline" className="w-full justify-start text-[#1A237E] border-slate-300 hover:border-[#1A237E] hover:bg-blue-50 transition-colors shadow-sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Teach on CourseCraft
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input placeholder="Search your courses..." className="pl-10 h-11 bg-white border-slate-200 rounded-full shadow-sm focus-visible:ring-[#1A237E]" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center font-bold shadow-md">
                            {session?.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </div>
                </div>

                {/* WELCOME SECTION */}
                <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                            Welcome back, <span className="text-[#1A237E]">{session?.user?.username || "Student"}</span>! 👋
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Pick up right where you left off.</p>
                    </div>

                    <div className="flex gap-4 sm:gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="px-4 text-center">
                            <span className="block text-2xl font-bold text-[#1A237E]">{enrolledCourses.length}</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Courses</span>
                        </div>
                        <div className="w-px bg-slate-200"></div>
                        <div className="px-4 text-center">
                            <span className="block text-2xl font-bold text-emerald-600">
                                {enrolledCourses.filter(c => c.progress === 100).length}
                            </span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed</span>
                        </div>
                    </div>
                </header>

                {/* ENROLLED COURSES GRID */}
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {enrolledCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col">
                                <div className="h-44 bg-slate-200 relative overflow-hidden shrink-0">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-[#1A237E]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle className="text-white h-14 w-14 drop-shadow-lg" />
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">{course.instructor}</p>

                                    <div className="mt-auto pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-[#1A237E] rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-[#1A237E]">{course.progress}%</span>
                                        </div>

                                        <Link href={`/learn/${course.id}`}>
                                            <Button className="w-full mt-4 bg-slate-900 hover:bg-[#1A237E] text-white rounded-xl shadow-md transition-all">
                                                Continue Learning
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Compass className="h-12 w-12 text-[#1A237E]" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Your learning journey awaits!</h3>
                        <p className="text-slate-500 mt-3 max-w-md text-center text-lg">You haven't enrolled in any courses yet. Explore our catalog and discover something amazing to learn today.</p>
                        <Link href="/courses" className="mt-8">
                            <Button size="lg" className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-10 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                                Explore The Catalog
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
```

### Next Steps for You:
1. Create `src/app/api/user/enrollments/route.ts` and paste the API code.
2. Update `src/app/(auth)/dashboard/page.tsx` with the new Frontend code.
3. Check your actual Dashboard! It should now dynamically fetch data. Note: Since you probably aren't enrolled in anything yet, you should see the beautiful "Your learning journey awaits!" empty state.

---

## Cheat Code #7: The Course Catalog (`app/courses/page.tsx`)

### The Public Shop Window
Yaar, backend mein already ek `GET /api/courses` route bana hua hai jo saare published courses return karta hai. Ab hume bas ek dedicated page banana hai jo un courses ko ek sundar grid mein dikhaye!

Aur sabse badi baat — `CourseCard` component pehle se hi ban chuka hai (`src/components/ui/CourseCard.tsx`). Woh reuse karenge, chakkar hi kya!

### Step 1: The Catalog Page (`app/courses/page.tsx`)
Create the folder and file `src/app/courses/page.tsx` and paste this code:

```tsx
// No "use client" here!
// This is a Server Component - DB se seedha data fetch karo, loading states ki zaroorat nahi!

import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/ui/CourseCard";

export default async function CoursesPage() {

    await dbConnect()

    // Seedha DB se, koi API call nahi, koi axios nahi!
    const courses = await CourseModel.find({ isPublished: true })
        .populate("instructor", "username email")
        .sort({ createdAt: -1 })
        .lean() // .lean() important hai - fast pure JS objects return karta hai

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* PAGE HEADER */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#1A237E] rounded-full">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Home
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A237E]">
                            Explore All Courses
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            {courses.length} {courses.length === 1 ? "course" : "courses"} available
                        </p>
                    </div>
                </div>
            </div>

            {/* COURSES GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course: any) => {

                            // Instructor safely extract karo - populate ke baad object ho sakta hai
                            const instId = course.instructor
                            const instructorName = typeof instId === 'object' && instId !== null
                                ? (instId.username || instId.email || 'Instructor')
                                : 'Instructor'

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
                            )
                        })}
                    </div>
                ) : (
                    // Empty State - agar koi course published nahi hai
                    <div className="text-center py-28 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-12 w-12 text-[#1A237E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            No courses available yet
                        </h2>
                        <p className="text-slate-500 mt-3 text-lg">
                            Instructors are working on amazing content. Check back soon!
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}
```

### Next Steps for You:
1. Create `src/app/courses/page.tsx` and paste the above code.
2. Visit `http://localhost:3000/courses` to see your catalog!
3. No courses showing? Login as an instructor and publish a course first!

> **Note**: `CourseCard` ka `href` `/courses/${courseId}` pe point karta hai - yeh Step 3 mein banana hai!

---

## Cheat Code #8: Course Overview & Enrollment (`app/courses/[courseId]/page.tsx`)

### The Main Event!
Yeh woh page hai jab student kisi CourseCard pe click karega. Yahan course ki poori detail dikhegi — title, description, chapters list — aur ek **Enroll** button hoga.

**Architecture samajhlo pehle:**
- `page.tsx` → **Server Component** (DB se seedha course fetch karega)
- `EnrollButton.tsx` → **Client Component** (because ismein `useSession` aur `axios` chahiye, jo sirf browser mein kaam karte hain)

Yeh pattern bilkul wohi hai jo humne dashboard mein use kiya tha!

### Step 1: The EnrollButton Client Component (`components/ui/EnrollButton.tsx`)
Pehle yeh chhota but important client component banao:

```tsx
"use client"

// Yeh "use client" isliye hai kyunki ismein hooks use ho rahe hain
// useSession - session check karna
// useState, useEffect - UI state manage karna
// useRouter - enrollment ke baad navigate karna

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
                // User logged in nahi hai, loading band karo
                setIsLoading(false)
            }
        }

        checkEnrollment()
    }, [courseId, status])

    const handleEnroll = async () => {

        // Agar logged in nahi hai toh sign-in pe bhejo
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

    // Check ho raha hai...
    if (isLoading) {
        return <Button disabled className="w-full h-12 text-base rounded-xl"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking...</Button>
    }

    // Pehle se enrolled hai? Toh "Go to Dashboard" dikhao
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

    // Default: Enroll button
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
```

### Step 2: The Course Overview Page (`app/courses/[courseId]/page.tsx`)
Ab main page banao. Yeh server component hai:

```tsx
// Server Component! No "use client"
// DB se seedha course fetch karo - fast aur SEO-friendly!

import dbConnect from "@/lib/dbConnect"
import CourseModel from "@/model/Course"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BookOpen, ChevronLeft, PlayCircle, User, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import EnrollButton from "@/components/ui/EnrollButton"

export default async function CourseDetailPage(
    { params }: { params: Promise<{ courseId: string }> }
) {

    await dbConnect()

    const { courseId } = await params

    const course = await CourseModel.findById(courseId)
        .populate("instructor", "username email")
        .lean()

    // Course nahi mila? Next.js ka notFound() use karo - 404 page show karega
    if (!course) {
        notFound()
    }

    // Instructor safely extract karo
    const instId = course.instructor as any
    const instructorName = typeof instId === 'object' && instId !== null
        ? (instId.username || instId.email || 'Instructor')
        : 'Instructor'

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* BACK BUTTON */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/courses">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#1A237E] rounded-full">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Courses
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT - Course Main Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Thumbnail */}
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-slate-200">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-slate-300" />
                                </div>
                            )}
                        </div>

                        {/* Title & Instructor */}
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                {course.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-3 text-slate-500">
                                <User className="h-4 w-4" />
                                <span className="font-medium">by {instructorName}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-3">About This Course</h2>
                            <p className="text-slate-600 leading-relaxed">{course.description}</p>
                        </div>

                        {/* Chapters List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-5">
                                <LayoutList className="h-5 w-5 text-[#1A237E]" />
                                <h2 className="text-xl font-bold text-slate-800">
                                    Course Content ({course.chapters?.length || 0} chapters)
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {(course.chapters as any[])?.map((chapter: any, index: number) => (
                                    <div
                                        key={chapter._id?.toString() || index}
                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <div className="h-8 w-8 bg-[#1A237E]/10 rounded-full flex items-center justify-center shrink-0">
                                            <PlayCircle className="h-4 w-4 text-[#1A237E]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">
                                                {index + 1}. {chapter.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - Sticky Enroll Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-5">
                            <div className="text-center">
                                <span className="text-4xl font-extrabold text-[#1A237E]">FREE</span>
                                <p className="text-slate-500 text-sm mt-1">Full lifetime access</p>
                            </div>

                            {/* This is the interactive client component */}
                            <EnrollButton courseId={courseId} />

                            <ul className="text-sm text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                                <li className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-[#1A237E] shrink-0" />
                                    {course.chapters?.length || 0} on-demand lessons
                                </li>
                                <li className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#1A237E] shrink-0" />
                                    Taught by {instructorName}
                                </li>
                                <li className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-[#1A237E] shrink-0" />
                                    Full course access on enrollment
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
```

### Next Steps for You:
1. Create `src/components/ui/EnrollButton.tsx` and paste the client component code.
2. Create `src/app/courses/[courseId]/page.tsx` and paste the page code.
3. Click any course card → you should see the Course Overview page!
4. Click **Enroll Now** → if not logged in, it redirects to `/sign-in`. If logged in, it enrolls you!

> **Pro Tip**: `notFound()` is imported from `next/navigation`. It automatically shows Next.js's 404 page if the course ID is invalid. Bahut clean hai yeh pattern!

---

## Cheat Code #9: The Learning Studio (`app/learn/[courseId]/page.tsx`)

### The Actual Classroom! 🎓
Yeh step 4 hai — jahan student actually course padhega/dekhega. Yeh page ek real classroom ki tarah hoga:
- **Left side:** Chapters ki list (sidebar)
- **Right side:** Selected chapter ka YouTube video (iframe mein — user site pe hi rahega!)
- **Button:** "Mark as Complete" — jo hamara `POST /api/courses/[courseId]/progress` API call karega

**Architecture:**
- Yeh poora page ek **Client Component** hoga — kyunki bahut saari interactivity hai (chapter select karna, video switch karna, mark complete karna)
- Server se data fetch karne ke liye `useEffect` + `axios` use karenge (same pattern as dashboard!)

### Step 1: The Learning Studio Page (`app/learn/[courseId]/page.tsx`)
Create folder `src/app/learn/[courseId]/` and file `page.tsx`:

```tsx
"use client"

// Poora page client side hai - bahut saari interactivity hai yahan
// Chapter click → video change, Mark Complete → API call

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Loader2, CheckCircle2, Circle, ChevronLeft, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

// Types - apna data kaisa dikhega
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

    // Course ka data
    const [course, setCourse] = useState<CourseData | null>(null)

    // Abhi konsa chapter chal raha hai - pehle chapter se shuru
    const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)

    // Completed chapters ki list (IDs) - yeh DB se aayega
    const [completedChapters, setCompletedChapters] = useState<string[]>([])

    // Loading states
    const [isLoadingPage, setIsLoadingPage] = useState(true)
    const [isMarkingComplete, setIsMarkingComplete] = useState(false)

    // Page load hote hi course data aur progress fetch karo
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Teen API calls ek saath parallel mein - fast!
                const [courseRes, enrollRes, progressRes] = await Promise.all([
                    axios.get(`/api/courses/${courseId}`),
                    axios.get(`/api/courses/${courseId}/check-enrollment`),
                    axios.get(`/api/courses/${courseId}/progress`)
                ])

                // Agar enrolled nahi hai toh course page pe bhej do
                if (!enrollRes.data.isEnrolled) {
                    toast.error("Access Denied", { description: "Pehle course enroll karo!" })
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
        <div className="flex min-h-screen bg-slate-900 text-white font-sans">

            {/* LEFT SIDEBAR - Chapters List */}
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
                                onClick={() => setActiveChapter(chapter)}
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
                            className={`shrink-0 rounded-xl h-11 px-6 font-semibold transition-all ${
                                isActiveChapterCompleted
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
```

### Next Steps for You:
1. Create folder `src/app/learn/[courseId]/` and file `page.tsx`, paste the above code.
2. Enroll in a course → go to Dashboard → click **Continue Learning** → it will open `/learn/[courseId]`
3. Click any chapter in the sidebar → video switches!
4. Click **Mark as Complete** → button turns green, progress bar updates!

> **Remember**: The `videoUrl` stored in each chapter must be a YouTube **embed** URL format:
> `https://www.youtube.com/embed/VIDEO_ID_HERE`
> NOT the regular watch URL. Store this when creating chapters from the Instructor Dashboard (Step 5)!

---

## Cheat Code #10: The Instructor Dashboard (`app/instructor/...`)

### The Control Room! 🎛️
Yeh Step 5 hai — Instructor ka apna area. Yahan pe instructor:
1. Apne saare courses dekh sakta hai
2. Naya course bana sakta hai
3. Ek existing course mein chapters add kar sakta hai aur usse publish kar sakta hai

**3 files banane hain:**
- `app/instructor/page.tsx` → Instructor ka personal dashboard (apne courses ki list)
- `app/instructor/courses/new/page.tsx` → Naya course banane ka form
- `app/instructor/courses/[courseId]/page.tsx` → Course editor (chapters add karo, publish karo)

---

### Step 1: Instructor Dashboard (`app/instructor/page.tsx`)
Instructor ke saare courses dikhao. Server Component — seedha DB se:

```tsx
// Server Component - direct DB query
import dbConnect from "@/lib/dbConnect"
import CourseModel from "@/model/Course"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, BookOpen, Eye, EyeOff, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function InstructorPage() {

    await dbConnect()

    const session = await auth()
    const user = session?.user

    // Agar INSTRUCTOR nahi hai toh seedha dashboard pe bhejo
    if (!user || user.role !== "INSTRUCTOR") {
        redirect("/dashboard")
    }

    // Sirf is instructor ke courses fetch karo
    const courses = await CourseModel.find({ instructor: user._id })
        .sort({ createdAt: -1 })
        .lean()

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A237E]">
                            Instructor Studio
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {courses.length} {courses.length === 1 ? "course" : "courses"} created
                        </p>
                    </div>
                    <Link href="/instructor/courses/new">
                        <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-xl shadow-md">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* COURSES LIST */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {courses.length > 0 ? (
                    <div className="space-y-4">
                        {courses.map((course: any) => (
                            <div
                                key={course._id.toString()}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="h-16 w-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="h-6 w-6 text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-slate-900 truncate">{course.title}</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {course.chapters?.length || 0} chapters
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                                    course.isPublished
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                }`}>
                                    {course.isPublished
                                        ? <><Eye className="h-3.5 w-3.5" /> Published</>
                                        : <><EyeOff className="h-3.5 w-3.5" /> Draft</>
                                    }
                                </div>

                                {/* Edit Button */}
                                <Link href={`/instructor/courses/${course._id.toString()}`}>
                                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:border-[#1A237E] hover:text-[#1A237E]">
                                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">No courses yet</h2>
                        <p className="text-slate-500 mt-2 mb-8">Create your first course and start teaching!</p>
                        <Link href="/instructor/courses/new">
                            <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-8">
                                <PlusCircle className="mr-2 h-4 w-4" /> Create First Course
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
```

---

### Step 2: Create New Course (`app/instructor/courses/new/page.tsx`)
Simple form — sirf title, description, thumbnail URL lo aur `POST /api/courses` karo:

```tsx
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
```

---

### Step 3: Course Editor (`app/instructor/courses/[courseId]/page.tsx`)
Yeh sabse important page hai — yahan chapters add hote hain aur course publish hota hai:

```tsx
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
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
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
```

### Next Steps for You:
1. Create `src/app/instructor/page.tsx` — Instructor dashboard
2. Create `src/app/instructor/courses/new/page.tsx` — New course form
3. Create `src/app/instructor/courses/[courseId]/page.tsx` — Course editor

> **Full Instructor Workflow:**
> 1. Go to `/instructor` → Click **New Course**
> 2. Fill form → automatically redirects to the **Course Editor**
> 3. In editor → Click **Add Chapter** → enter title, YouTube embed URL, notes → **Add**
> 4. Repeat for all chapters
> 5. When ready → click **Publish Course** → course appears on `/courses` for students!

---

## Cheat Code #11: Become Instructor Flow (`/become-instructor`)

### The Role Upgrade Problem 🔑
Jab koi student "instructor" banna chahta hai, toh sirf DB mein `role: "INSTRUCTOR"` set karna kaafi nahi hai.

**Why?** Because the user's session is a **JWT token** stored in the browser. Once issued at login time, the JWT contains `{ role: "STUDENT" }` and stays that way — even if you update MongoDB — until the user logs out and logs back in.

```
JWT Token (in browser) ←——— Never changes automatically
      ↕
MongoDB User Doc      ←——— Ye update ho gaya, but browser nahi janta!
```

**The Fix:** After upgrading the role in DB → force `signOut()` → user logs in again → new JWT with `role: "INSTRUCTOR"` ✅

### File 1: API Route (`src/app/api/become-instructor/route.ts`)

```ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
    await dbConnect();
    try {

        const session = await auth();
        const user = session?.user;

        if (!session || !user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized — pehle login karo"
            }, { status: 401 });
        }

        // Agar pehle se hi instructor hai toh kuch karne ki zaroorat nahi
        if (user.role === "INSTRUCTOR") {
            return NextResponse.json({
                success: false,
                message: "Aap pehle se hi instructor hain!"
            }, { status: 400 });
        }

        // MongoDB mein role update karo
        await UserModel.findByIdAndUpdate(
            user._id,
            { role: "INSTRUCTOR" },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Congratulations! Ab aap instructor ban gaye. Please re-login karein."
        }, { status: 200 });

    } catch (error) {
        console.error("Error in become-instructor route", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
```

### File 2: The Page (`src/app/(auth)/become-instructor/page.tsx`)
Dark gradient marketing page → calls API → calls `signOut()`:

Key pattern — the signOut with delay:
```tsx
// DB update ke baad
await axios.post("/api/become-instructor")

// JWT refresh ke liye signOut zaroori hai
// 1.5s delay taaki toast dikh sake
setTimeout(() => {
    signOut({ callbackUrl: "/sign-in" })
}, 1500)
```

### The Full User Flow:
```
Dashboard → "Teach on CourseCraft" → /become-instructor
    → "Start Teaching" button clicked
        → POST /api/become-instructor runs
            → MongoDB: role = "INSTRUCTOR" ✅
        → signOut({ callbackUrl: "/sign-in" }) called
            → User sees sign-in page
    → User logs in again
        → JWT created fresh: { role: "INSTRUCTOR" } ✅
        → /instructor page now accessible!
```

> **Key Insight**: Yeh "logout to refresh session" pattern industry standard hai. GitHub bhi yahi karta hai jab aap kisi organization join karte ho. Clean aur predictable!

---

## Cheat Code #12: Route Protection with `proxy.ts` 🛡️

### The "Proxy" vs "Middleware" Rename
**Next.js 16+ Update**: The file `middleware.ts` has been renamed to **`proxy.ts`**. This is because "middleware" was confusing for beginners, and "proxy" better describes its role as a network boundary or edge bridge.

### File: `src/proxy.ts`
Copy this file to protect your sensitive routes (/dashboard, /learn, etc.) from non-logged-in users.

```ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // List of routes that REQUIRE login
    const protectedRoutes = ["/dashboard", "/learn", "/instructor", "/become-instructor"]
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    // Redirect to sign-in if trying to access protected route without session
    if (isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }
})

export const config = {
    // Skip static files, images, and API routes
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
```

### 🗝️ Summary of All Critical Fixes Applied:
1. **Metadata**: Updated `layout.tsx` title from "Create Next App" to "CourseCraft".
2. **Security**: Added `proxy.ts` (Next.js 16 name for middleware) to protect private routes.
3. **Sidebar**: FIXED logic to show "Instructor Studio" only for Instructors.
4. **Search**: Wired up the Dashboard search bar to filter your courses.
5. **UI Fixes**: Removed broken `/profile` link and fixed JSX syntax in Dashboard.
6. **Cleanup**: Deleted the redundant/empty `src/app/courses` folder.
