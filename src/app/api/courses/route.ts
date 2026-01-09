import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import { courseSchema } from "@/schemas/courseSchema";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {

    await dbConnect()

    const session = await auth()
    const user = session?.user

    if (!session || !user || user.role !== "INSTRUCTOR") {
        return NextResponse.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 })
    }

    // const user = { _id: "695ffe1d137d1560d30a37fd" };

    try {

        const body = await request.json()
        const result = courseSchema.safeParse(body)
        console.log("result", result)
        if (!result.success) {
            const errorMessages = result.error.errors[0].message;
            return NextResponse.json({
                success: false,
                message: errorMessages
            }, { status: 400 })
        }

        const { title, description, thumbnail, isPublished, chapters } = result.data

        const newCourse = await CourseModel.create({
            title,
            description,
            thumbnail,
            isPublished,
            chapters,
            instructor: user._id
        })

        return NextResponse.json({
            success: true,
            message: "Course created successfully",
            course: newCourse
        }, { status: 201 })

    } catch (error) {
        console.log("error in creating course", error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })
    }
}

export async function GET(request: Request) {

    await dbConnect()

    try {

        const courses = await CourseModel.find({ isPublished: true })
            .populate("instructor", "username email")
            .sort({ createdAt: -1 })

        return NextResponse.json({
            success: true,
            message: "Courses fetched successfully",
            courses
        }, { status: 200 })

    } catch (error) {

        console.error("Error in get request for course", error)

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })

    }

}

