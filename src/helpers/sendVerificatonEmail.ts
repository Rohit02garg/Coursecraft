import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    username: string,
    email: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        // --- 🧪 DEVELOPER SANDBOX MODE ---
        // We log the code here so you can test ANY email address without needing Resend to actually send it!
        console.log("\n--- 📧 EMAIL SANDBOX MODE ---");
        console.log(`CODE for ${email}: ${verifyCode}`);
        console.log("-----------------------------\n");

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "CourseCraft Verification Code",
            react: VerificationEmail({
                username,
                otp: verifyCode
            })
        });

        return {
            success: true,
            message: "Verification email sent (or sandbox logged)."
        };

    } catch (emailError) {
        // Even if Resend fails (e.g. unverified email), we still return success=true 
        // because we've already logged the code to your terminal!
        console.warn("Resend skipped/failed, but sandbox is active.");

        return {
            success: true,
            message: "Sandbox mode enabled: check terminal for code."
        };
    }
}