import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import UserModel from "@/model/User";

export async function POST(request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    await dbConnect()

    try {

        const session = await auth()
        const user = session?.user

        if (!session || !user) {
            console.error("User not authenticated")
            return NextResponse.json({
                success: false,
                message: "User not authenticated"
            }, {
                status: 401
            })
        }

        const courseId = (await params).courseId

        // const user = { _id: "695ffe1d137d1560d30a37fd" };
        // const courseId = "695ffe1d137d1560d30a37fd";

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $addToSet: { enrolledCourses: courseId }
            },
            { new: true }
        )

        if (!updatedUser) {
            console.error("User not found or update failed")
            return NextResponse.json({
                success: false,
                message: "User not found or update failed"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            success: true,
            message: "Enrolled successfully"
        }, { status: 200 });


    } catch (error) {
        console.error("Error in enroll route", error)
        return NextResponse.json({
            success: false,
            message: "Error in enroll route"
        }, {
            status: 500
        })
    }

}