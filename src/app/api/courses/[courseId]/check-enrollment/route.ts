import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {

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

        const { courseId } = await params

        // const user = { _id: "695ffe1d137d1560d30a37fd" };
        // const courseId = "695ffe1d137d1560d30a37fd";

        const userInDB = await UserModel.findById(user._id)

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

        const isEnrolled = userInDB.enrolledCourses.includes(courseId as any)

        return NextResponse.json({
            success: true,
            message: "Enrollment checked successfully",
            isEnrolled: isEnrolled
        },
            {
                status: 200
            }
        )

    } catch (error) {

        console.error("Error checking enrollment", error)
        return NextResponse.json({
            success: false,
            message: "Error checking enrollment"
        },
            {
                status: 500
            }
        )

    }

}