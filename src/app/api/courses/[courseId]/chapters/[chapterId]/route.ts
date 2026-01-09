import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import { chapterSchema } from "@/schemas/courseSchema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{
        courseId: string;
        chapterId: string;
    }>
}

export async function DELETE(
    request: Request,
    { params }: RouteParams) {

    await dbConnect()

    try {

        const { courseId, chapterId } = await params
        const session = await auth()
        const user = session?.user

        if (!user || !session) {

            console.error("Unauthorized user")
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })

        }

        const course = await CourseModel.findById(courseId)

        if (!course) {

            console.error("Course not found")
            return NextResponse.json({
                success: false,
                message: "Course not found"
            }, { status: 404 })

        }

        if (course.instructor.toString() !== user._id?.toString()) {

            console.error("Unauthorized user")
            return NextResponse.json({
                success: false,
                message: "Unauthorized, only owner can delete chapter"
            }, { status: 401 })

        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            courseId,
            {
                $pull: {
                    chapters: {
                        _id: chapterId
                    }
                }
            },
            {
                new: true
            }
        )

        return NextResponse.json(
            {
                success: true,
                message: "Chapter deleted successfully",
                data: updatedCourse
            },
            {
                status: 200
            }
        )

    } catch (error) {

        console.error("Error in delete chapter route", error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })

    }

}

export async function PATCH(
    request: Request,
    { params }: RouteParams
) {
    await dbConnect()

    try {

        const { courseId, chapterId } = await params
        const session = await auth()
        const user = session?.user

        if (!user || !session) {
            console.error("Unauthorized user")
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        const course = await CourseModel.findById(courseId)

        if (!course) {
            console.error("Course not found")
            return NextResponse.json({
                success: false,
                message: "Course not found"
            }, { status: 404 })
        }

        if (course.instructor.toString() !== user._id?.toString()) {
            console.error("Unauthorized user")
            return NextResponse.json({
                success: false,
                message: "Unauthorized, only owner can update chapter"
            }, { status: 401 })
        }

        const body = await request.json()
        const parsedResult = chapterSchema.partial().safeParse(body)

        if (!parsedResult.success) {
            console.error("Invalid chapter data")
            return NextResponse.json({
                success: false,
                message: "Invalid chapter data"
            }, { status: 400 })
        }

        const { title, content, videoUrl, isFree } = parsedResult.data

        const updatedCourse = await CourseModel.findOneAndUpdate(
            {
                _id: courseId,
                "chapters._id": chapterId
            },
            {
                $set: {
                    ...(title && { "chapters.$.title": title }),
                    ...(content && { "chapters.$.content": content }),
                    ...(videoUrl && { "chapters.$.videoUrl": videoUrl }),
                    ...(isFree !== undefined && { "chapters.$.isFree": isFree }),
                }
            },
            { new: true }
        )

        if (!updatedCourse) {
            console.error("Chapter not found")
            return NextResponse.json({
                success: false,
                message: "Chapter not found"
            }, { status: 404 })
        }

        return NextResponse.json(
            {
                success: true,
                message: "Chapter updated successfully",
                data: updatedCourse
            },
            {
                status: 200
            }
        )

    } catch (error) {

        console.error("Error in patch chapter route", error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })

    }

}