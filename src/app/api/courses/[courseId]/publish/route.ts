import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import CourseModel from "@/model/Course";

interface RouteParams {
    params: Promise<{
        courseId: string;
    }>
}

export async function POST(
    request: Request,
    { params }: RouteParams
) {
    await dbConnect()

    try {

        const session = await auth()
        const user = session?.user

        if (!session || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            )
        }

        const courseId = await params

        // const user = { _id: "695ffe1d137d1560d30a37fd" };
        // const courseId = "6960ed8e4efe3ef7c56ee58b"

        const course = await CourseModel.findById(courseId)

        if (!course) {
            console.error("Course not found")
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not found"
                },
                {
                    status: 404
                }
            )
        }

        if (course.instructor.toString() !== user._id?.toString()) {
            console.error("Unauthorized")
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized, only owner can publish the course"
                },
                {
                    status: 401
                }
            )
        }

        const hasChapter = course?.chapters?.length > 0
        const hasRequiredFields = course?.title && course?.description && course?.thumbnail

        if (!hasChapter) {
            console.error("Course is not ready to publish, it must have at least one chapter")
            return NextResponse.json(
                {
                    success: false,
                    message: "Course is not ready to publish, it must have at least one chapter"
                },
                {
                    status: 400
                }
            )
        }

        if (!hasRequiredFields) {
            console.error("Course is not ready to publish, it must have all required fields")
            return NextResponse.json(
                {
                    success: false,
                    message: "Course is not ready to publish, it must have all required fields"
                },
                {
                    status: 400
                }
            )
        }

        course.isPublished = true
        await course.save()

        return NextResponse.json(
            {
                success: true,
                message: "Course published successfully",
                course
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error("Error in Ispublished post route", error)
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error"
            },
            { status: 500 }
        )
    }

}