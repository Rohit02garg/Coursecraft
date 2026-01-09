import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { courseSchema } from "@/schemas/courseSchema";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {

    await dbConnect()

    try {
        const { courseId } = await params
        const course = await CourseModel.findById(courseId)
            .populate("instructor", "username email")
            .populate("chapters")

        if (!course) {
            console.error("Course not found")

            return NextResponse.json({
                success: false,
                message: "Course not found"
            }, { status: 404 })

        }

        return NextResponse.json({
            success: true,
            message: "Course fetched successfully",
            course
        }, { status: 200 })

    } catch (error) {
        console.error("Error in get request for course", error)

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })
    }

}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {

    await dbConnect()

    try {

        const session = await auth()
        const user = session?.user
        const { courseId } = await params

        if (!session || !user) {
            console.error("Unauthorized")

            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }


        const body = await request.json()
        const parseResult = courseSchema.partial().safeParse(body)

        if (!parseResult.success) {
            console.error("Invalid request body")

            return NextResponse.json({
                success: false,
                message: "Invalid request body"
            }, { status: 400 })
        }

        const { ...validatedData } = parseResult.data

        const course = await CourseModel.findById(courseId)

        if (!course) {
            console.error("Course not found")

            return NextResponse.json({
                success: false,
                message: "Course not found"
            }, { status: 404 })
        }

        if (course.instructor.toString() !== user._id?.toString()) {
            console.error("Unauthorized")

            return NextResponse.json({
                success: false,
                message: "Unauthorized, You must be the instructor of this course to update it"
            }, { status: 401 })
        }

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            courseId,
            { ...validatedData },
            { new: true }
        )

        return NextResponse.json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        }, { status: 200 })


    } catch (error) {

        console.error("Error in patch request for course", error)

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })

    }

}