import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";


export async function POST(request: Request) {
    await dbConnect()

    try {

        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (user) {

            const isCodeNotExpired = user.verifyCodeExpiry && user.verifyCodeExpiry.getTime() > Date.now()

            if (isCodeNotExpired) {

                const isCodeMatched = await bcrypt.compare(code, user.verifyCode)

                if (isCodeMatched) {

                    user.isVerified = true
                    await user.save()

                    return Response.json(
                        {
                            success: true,
                            message: "User verified successfully"
                        },
                        {
                            status: 200
                        }
                    )

                } else {
                    return Response.json(
                        {
                            success: false,
                            message: "Invalid verification code"
                        },
                        {
                            status: 400
                        }
                    )
                }

            } else {
                return Response.json(
                    {
                        success: false,
                        message: "Verification code expired"
                    },
                    {
                        status: 400
                    }
                )
            }

        } else {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

    } catch (error) {
        console.error('Error verifying user', error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },
            {
                status: 500
            }
        )
    }
}