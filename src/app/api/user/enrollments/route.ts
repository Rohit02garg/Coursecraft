import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import CourseModel from "@/model/Course";
import CourseProgressModel from "@/model/CourseProgress";

export async function GET(request: Request) {
    await dbConnect();
    try {

        const session = await auth()
        const user = session?.user

        if (!user || !session) {
            console.error("Unauthorised")
            return NextResponse.json(
                { success: false, message: "Unauthorised" },
                { status: 401 }
            )
        }

        const userInDB = await UserModel.findById(user._id)
            .populate({
                path: "enrolledCourses",
                select: "title description thumbnail instructor chapters",
                populate: {
                    path: "instructor",
                    select: "username email",   // pull username (and email as fallback)
                    model: "User"
                }
            })

        if (!userInDB) {
            console.error("User not found")
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

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
                instructor: course.instructor?.username || course.instructor?.email || "Unknown",
                thumbnail: course.thumbnail,
                progress: progressPercentage
            })

        }

        return NextResponse.json(
            {
                success: true,
                message: "Enrollments fetched successfully",
                enrollments
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch enrollments" },
            { status: 500 }
        );
    }
}