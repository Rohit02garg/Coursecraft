import dbConnect from "@/lib/dbConnect";
import CourseProgressModel from "@/model/CourseProgress";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import CourseModel from "@/model/Course";

// GET - fetch karo user ka progress for a course
export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    await dbConnect();
    try {

        const session = await auth();
        const user = session?.user;
        if (!session || !user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const { courseId } = await params;

        const progress = await CourseProgressModel.findOne({
            userId: user._id,
            courseId: courseId
        })

        // Agar progress record hi nahi hai (naya student) toh empty array return karo
        return NextResponse.json({
            success: true,
            message: "Progress fetched successfully",
            completedChapters: progress?.completedChapters ?? [],
            isCompleted: progress?.isCompleted ?? false
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching progress", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    await dbConnect();
    try {

        const session = await auth();
        const user = session?.user;
        if (!session || !user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }
        const { courseId } = await params;
        const { chapterId, isCompleted } = await request.json();

        const progress = await CourseProgressModel.findOneAndUpdate(
            {
                userId: user._id,
                courseId: courseId
            },
            isCompleted
                ? { $addToSet: { completedChapters: chapterId } }
                : { $pull: { completedChapters: chapterId } },
            {
                new: true,
                upsert: true,
                defaults: { isCompleted: false }
            }
        );

        const course = await CourseModel.findById(courseId)

        if (course) {

            const totalChapters = course.chapters.length;
            const completedChapters = progress.completedChapters.length;

            const isAllCompleted = totalChapters > 0 && totalChapters === completedChapters;

            if (progress.isCompleted !== isAllCompleted) {
                progress.isCompleted = isAllCompleted;
                await progress.save();
            }

        }

        return NextResponse.json({
            success: true,
            message: "Progress updated successfully",
            progress
        }, { status: 200 });

    } catch (error) {
        console.error("Error in progress route", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}