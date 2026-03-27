import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
    await dbConnect();
    try {

        const session = await auth();
        const user = session?.user;

        if (!session || !user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized — pehle login karo"
            }, { status: 401 });
        }

        // Agar pehle se hi instructor hai toh kuch karne ki zaroorat nahi
        if (user.role === "INSTRUCTOR") {
            return NextResponse.json({
                success: false,
                message: "Aap pehle se hi instructor hain!"
            }, { status: 400 });
        }

        // MongoDB mein role update karo
        await UserModel.findByIdAndUpdate(
            user._id,
            { role: "INSTRUCTOR" },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Congratulations! Ab aap instructor ban gaye. Please re-login karein."
        }, { status: 200 });

    } catch (error) {
        console.error("Error in become-instructor route", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
