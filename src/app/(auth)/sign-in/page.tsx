"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

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
                toast.success("Welcome Back", {
                    description: "Sign-in successful. Happy learning!",
                });
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
        <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[680px]">

                {/* LEFT SIDE - Premium Subtle Illustration Area */}
                <div className="hidden md:flex md:w-1/2 bg-slate-50 relative items-center justify-center p-12 overflow-hidden border-r border-slate-50">
                    <div className="absolute top-12 left-12 w-8 h-8 border border-slate-200 rounded-full opacity-50"></div>
                    <div className="absolute bottom-20 right-16 w-6 h-6 border border-slate-200 rounded-full opacity-50"></div>
                    <svg className="absolute top-24 right-20 w-32 h-32 text-slate-100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 50 Q 25 25 50 50 T 90 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        <path d="M10 70 Q 25 45 50 70 T 90 70" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>

                    <div className="z-10 text-center flex flex-col items-center">
                        <div className="w-56 h-56 bg-white rounded-[32px] border border-slate-100 flex justify-center items-center shadow-sm mb-8 -rotate-1">
                            <div className="p-8 text-center">
                                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Lock className="h-6 w-6 text-indigo-600" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Secure Access<br/>Learning Vault</p>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight px-10">Welcome back to your dashboard.</h2>
                    </div>
                </div>

                {/* RIGHT SIDE - Form Area */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
                    
                    <BackButton fallbackHref="/" label="Home" className="absolute top-8 left-8 md:left-16" />

                    <div className="mb-10 mt-4 text-center md:text-left">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
                            Sign In
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Enter your credentials to access CourseCraft
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* IDENTIFIER FIELD */}
                            <FormField
                                name="identifier"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Username or Email"
                                                    className="pl-12 h-12 rounded-2xl border-slate-100 bg-white focus-visible:ring-indigo-600 text-sm font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-rose-500 uppercase tracking-widest" />
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
                                                <Lock className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    className="pl-12 h-12 rounded-2xl border-slate-100 bg-white focus-visible:ring-indigo-600 text-sm font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-rose-500 uppercase tracking-widest" />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-slate-950 hover:bg-black text-white font-bold text-sm shadow-xl shadow-slate-200 transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* SIGN UP LINK */}
                    <div className="mt-12">
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            New here?{" "}
                            <Link
                                href="/sign-up"
                                className="text-indigo-600 hover:text-indigo-700 font-bold ml-2"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}