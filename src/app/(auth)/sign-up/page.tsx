"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounceCallback } from "usehooks-ts";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Lock } from "lucide-react";
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

import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const debounced = useDebounceCallback(setUsername, 100);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<any>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/sign-up", data);

      toast.success("Success", {
        description: response.data.message || "Signed up successfully!",
      });

      router.push(`/verify/${data.username}`);
    } catch (error) {
      console.error("Error during sign up:", error);
      const axiosError = error as AxiosError<any>;
      toast.error("Sign Up Failed", {
        description: axiosError.response?.data.message ?? "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#8DA2EA] p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        {/* LEFT SIDE - Illustration Area */}
        <div className="hidden md:flex md:w-1/2 bg-[#E6F0FF] relative items-center justify-center p-12 overflow-hidden">
          {/* Decorative background elements matching the theme */}
          <div className="absolute top-12 left-12 w-6 h-6 border-2 border-slate-300 rounded-full"></div>
          <div className="absolute bottom-20 right-16 w-4 h-4 border-2 border-slate-400 rounded-full"></div>
          <svg className="absolute top-24 right-20 w-16 h-16 text-slate-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 Q 25 25 50 50 T 90 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 70 Q 25 45 50 70 T 90 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Place your actual image here later. Example:
              <img src="/student-illustration.png" alt="Student" className="z-10 w-full max-w-sm object-contain" />
          */}
          <div className="z-10 text-center flex flex-col items-center">
            <div className="w-48 h-48 bg-white/50 backdrop-blur-md rounded-2xl border border-white flex justify-center items-center shadow-sm mb-6 rotate-3 hover:rotate-0 transition-transform">
              <span className="text-slate-400/80 font-medium px-4 text-center">Place Illustration Here</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A237E] mb-2">
              Student Sign Up
            </h1>
            <p className="text-sm text-gray-500">
              Hey, enter your details to create your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* USERNAME FIELD */}
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Enter your username"
                          className="pl-12 h-12 rounded-xl border border-gray-200 bg-white shadow-sm focus-visible:ring-[#1A237E]"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            debounced(e.target.value);
                          }}
                        />
                        {isCheckingUsername && (
                          <Loader2 className="absolute right-3.5 top-3.5 animate-spin h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </FormControl>
                    {!isCheckingUsername && usernameMessage && (
                      <p
                        className={`text-xs pl-1 ${usernameMessage === "Username is available"
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {usernameMessage}
                      </p>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* EMAIL FIELD */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Enter your email"
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
                          placeholder="Enter your password"
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
                      Please wait
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* LOGIN LINK */}
          <div className="mt-8">
            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-[#1A237E] hover:underline"
              >
                Sign In Now
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
