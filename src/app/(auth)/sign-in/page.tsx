"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { signInSchema } from "@/schemas/signInSchema";
import { set } from "mongoose";

export default function SignInPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })
    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true)
        try {
            const result = await signIn("credentials", {
                redirect: false,
                identifier: data.identifier,
                password: data.password
            })
            if (result?.error) {
                if (result.error === "CredentialsSignin") {
                    toast.error("Login Failed", {
                        description: "Incorrect username/email or password",
                    });
                } else {
                    toast.error("Error", {
                        description: result.error,
                    });
                }
            } else if (result?.url) {
                toast.success("Welcome Back!", {
                    description: "You have signed in successfully.",
                });
                // Redirect to dashboard (or wherever your protected route is)
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Sign in failed:", error);
            toast.error("Error", {
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-[#8DA2EA] p-4 md:p-8">
            <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">

                {/* LEFT SIDE - Illustration Area */}
                <div className="hidden md:flex md:w-1/2 bg-[#E6F0FF] relative items-center justify-center p-12 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-12 left-12 w-6 h-6 border-2 border-slate-300 rounded-full"></div>
                    <div className="absolute bottom-20 right-16 w-4 h-4 border-2 border-slate-400 rounded-full"></div>
                    <svg className="absolute top-24 right-20 w-16 h-16 text-slate-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 50 Q 25 25 50 50 T 90 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 70 Q 25 45 50 70 T 90 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                    <div className="z-10 text-center flex flex-col items-center">
                        <div className="w-48 h-48 bg-white/50 backdrop-blur-md rounded-2xl border border-white flex justify-center items-center shadow-sm mb-6 -rotate-3 hover:rotate-0 transition-transform">
                            <span className="text-slate-400/80 font-medium px-4 text-center">Login Illustration Here</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Form Area */}
                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-[#1A237E] mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-gray-500">
                            Sign in to continue your learning journey
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* IDENTIFIER FIELD */}
                            <FormField
                                name="identifier"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    placeholder="Email or Username"
                                                    className="pl-12 h-12 rounded-xl border border-gray-200 bg-white shadow-sm focus-visible:ring-[#1A237E]"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* PASSWORD FIELD */}
                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    className="pl-12 h-12 rounded-xl border border-gray-200 bg-white shadow-sm focus-visible:ring-[#1A237E]"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-[#2442AD] hover:bg-[#1A237E] text-white font-medium text-base shadow-md transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Signing in
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* SIGN UP LINK */}
                    <div className="mt-8">
                        <p className="text-center text-xs text-gray-500">
                            New to CourseCraft?{" "}
                            <Link
                                href="/sign-up"
                                className="font-medium text-[#1A237E] hover:underline"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}