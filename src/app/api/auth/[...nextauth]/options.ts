import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"

export const authOptions: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()

                try {
                    // Email is case-insensitive; username is case-sensitive.
                    // We use a case-insensitive regex for the email lookup so that
                    // existing accounts whose emails were stored with mixed case
                    // (before the lowercase normalisation was added) still work.
                    const identifier = (credentials.identifier as string).trim();
                    const isEmail = identifier.includes('@');

                    // Escape any regex special chars in the identifier before using as regex
                    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    const user = await UserModel.findOne(
                        isEmail
                            ? { email: { $regex: new RegExp(`^${escaped}$`, 'i') } }
                            : { username: identifier }   // exact match — usernames are case-sensitive
                    )

                    if (!user) {
                        throw new Error("No user found")
                    }

                    if (!user.isVerified) {
                        throw new Error("User is not verified")
                    }

                    const ispasswordcorrect = await bcrypt.compare(credentials.password, user.password)

                    if (!ispasswordcorrect) {
                        throw new Error("Incorrect password")
                    } else {
                        return user
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified
                token.username = user.username
                token.role = user.role
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user._id = token._id as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.username = token.username as string;
                session.user.role = token.role as "STUDENT" | "INSTRUCTOR"
            }
            return session
        }
    },
    pages: {
        signIn: '/sign-in',

    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
}