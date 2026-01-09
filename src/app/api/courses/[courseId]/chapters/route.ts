import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chapterSchema } from "@/schemas/courseSchema";

export async function POST(
    request: Request,
    { params }: {
        params: Promise<{ courseId: string }>
    }
) {

    await dbConnect()

    try {

        const session = await auth()
        const user = session?.user

        // const user = { _id: "695ffe1d137d1560d30a37fd", role: "INSTRUCTOR" };
        // const session = true;

        const { courseId } = await params

        if (!session || !user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        const body = await request.json()
        const parsedResult = chapterSchema.safeParse(body)

        if (!parsedResult.success) {
            console.error("Invalid request body")

            return NextResponse.json({
                success: false,
                message: "Invalid request body"
            }, { status: 400 })
        }

        const { title, content, videoUrl, isFree } = parsedResult.data

        const course = await CourseModel.findById(courseId)

        if (!course) {
            return NextResponse.json({
                success: false,
                message: "Course not found"
            }, { status: 404 })
        }

        if (course.instructor.toString() !== user._id?.toString()) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        const newChapter = {
            title,
            content,
            videoUrl,
            isFree,
        }

        course.chapters.push(newChapter as any)

        await course.save()

        return NextResponse.json({
            success: true,
            message: "Chapter added successfully"
        }, { status: 201 })

    } catch (error) {

        console.error("Error adding chapter", error)

        return NextResponse.json({
            success: false,
            message: "Error adding chapter"
        }, { status: 500 })

    }

}