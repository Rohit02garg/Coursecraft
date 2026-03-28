"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { useRouter, useParams } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
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

      toast.success("Account Verified", {
        description: response.data.message || "Your account has been activated.",
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
            <div className="w-56 h-56 bg-white rounded-[32px] border border-slate-100 flex justify-center items-center shadow-sm mb-8 rotate-3">
              <div className="p-8 text-center">
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Identity Check<br />Awaiting Clearance</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight px-10">One last step to unlock your potential.</h2>
          </div>
        </div>

        {/* RIGHT SIDE - Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">

          <BackButton fallbackHref="/sign-up" className="absolute top-8 left-8 md:left-16" />

          <div className="mb-10 mt-4 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
              Verify Identity
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Enter the security code sent to your email
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* CODE FIELD */}
              <FormField
                name="code"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="6-digit verification code"
                          className="pl-12 h-12 rounded-2xl border-slate-100 bg-white focus-visible:ring-indigo-600 text-sm font-medium tracking-[0.2em]"
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
                      Verifying...
                    </>
                  ) : (
                    "Authorize Account"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-12 text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
              Didn't receive the code?<br />
              <button onClick={() => toast.info("Check Terminal", { description: "Grab the code from your VS Code terminal (Sandbox Mode)." })} className="text-indigo-600 hover:text-indigo-700 mt-1">
                Resend Security Code
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
