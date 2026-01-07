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
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

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