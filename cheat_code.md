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
