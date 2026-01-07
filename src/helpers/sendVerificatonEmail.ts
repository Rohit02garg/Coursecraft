import { resend } from "@/lib/resend";

import VerificationEmail from "@/emails/VerificationEmail";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    username: string,
    email: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {

        console.log("Sending verification email to:", email);

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Coursecraft Verification Code",
            react: VerificationEmail({
                username,
                otp: verifyCode
            })
        });

        console.log("Verification email sent to:", email);

        return {
            success: true,
            message: "Verification email sent successfully."
        };

    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {
            success: false,
            message: "Failed to send verification email."
        };
    }
}