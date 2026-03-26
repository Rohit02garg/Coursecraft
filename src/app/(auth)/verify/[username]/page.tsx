"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { useRouter, useParams } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";

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

import { verifySchema } from "@/schemas/verifySchema";

export default function VerifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });

      toast.success("Success", {
        description: response.data.message || "Account verified successfully!",
      });

      router.push("/sign-in");
    } catch (error) {
      console.error("Error during verification:", error);
      const axiosError = error as AxiosError<any>;
      toast.error("Verification Failed", {
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

          <div className="z-10 text-center flex flex-col items-center">
            <div className="w-48 h-48 bg-white/50 backdrop-blur-md rounded-2xl border border-white flex justify-center items-center shadow-sm mb-6 rotate-3 hover:rotate-0 transition-transform">
              <span className="text-slate-400/80 font-medium px-4 text-center">Verification Illustration Here</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A237E] mb-2">
              Verify Your Account
            </h1>
            <p className="text-sm text-gray-500">
              Enter the verification code sent to your email
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* CODE FIELD */}
              <FormField
                name="code"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Enter your 6-digit code"
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
                    "Verify Account"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

      </div>
    </div>
  );
}
