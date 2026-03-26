# CourseCraft Cheat Codes
*Style: Chai aur Code (MysteryMessage Format)*

---

## Cheat Code #1: Sign-Up Page (`app/(auth)/sign-up/page.tsx`)

### Step 1: Install Dependencies
Open your terminal and run:
```bash
npm install react-hook-form @hookform/resolvers axios usehooks-ts
```
*(Ensure ShadCN UI form components and Sonner are also installed)*
```bash
npx shadcn@latest add form input button sonner
```

### Step 2: The Skeleton (Updated for Sonner!)
Create `src/app/(auth)/sign-up/page.tsx` and paste this code pattern. Notice how we use `useDebounceCallback` and `axios` just like in Mystery Message, but we now use `sonner` for the modern toast notifications!

```tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounceCallback } from "usehooks-ts";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// (Your ShadCN UI Components)
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Using Sonner instead of old toast!

// Your existing Zod schema
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // MAGIC: Wait 300ms after typing before setting state
  const debounced = useDebounceCallback(setUsername, 300);

  // Initialize the form
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // EFFECT: Whenever 'username' changes (debounce), hit our unique check API
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage(""); // Reset message
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

  // Handle final submission
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/sign-up", data);
      
      // Modern Sonner Toast
      toast.success("Success", {
        description: response.data.message || "Signed up successfully!",
      });
      
      router.push(`/verify/${username}`);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-black">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join CourseCraft
          </h1>
          <p className="mb-4 text-gray-500">Sign up to start learning</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* USERNAME FIELD */}
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="hitesh"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e); 
                        debounced(e.target.value); 
                      }}
                    />
                  </FormControl>
                  
                  {isCheckingUsername && <Loader2 className="animate-spin h-4 w-4" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p className={`text-sm ${
                      usernameMessage === "Username is unique" ? "text-green-500" : "text-red-500"
                    }`}>
                      {usernameMessage}
                    </p>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL FIELD */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <p className="text-muted-foreground text-sm">We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD FIELD */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
```

### Next Steps for You:
1. Run `npx shadcn@latest add form input button sonner` in your terminal.
2. To make Sonner Toasts appear on your screen, you must add `<Toaster />` to your global `layout.tsx` file (usually `src/app/layout.tsx`). Add `import { Toaster } from "@/components/ui/sonner"` at the top, and put `<Toaster />` right above your closing `</body>` tag!
3. Paste the updated skeleton into `src/app/(auth)/sign-up/page.tsx`.
4. Fill out the "YOUR TURN" sections for Email and Password!

---

## Cheat Code #2: Verify Page (`app/(auth)/verify/[username]/page.tsx`)

### Step 1: The Verification Skeleton

Now let's build the OTP/Verification page. We will continue using our beautiful 2-column layout! We need to extract the `username` from the URL parameters to tell our backend *who* we are verifying.

Create the file `src/app/(auth)/verify/[username]/page.tsx` and paste this skeleton:

```tsx
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
  // MAGIC: Next.js gives us the URL params easily!
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
      /* YOUR TURN: 
         1. Make an axios POST request to "/api/verify-code"
         2. Send an object with { username: params.username, code: data.code }
         3. Show a sonner toast.success with the response message!
         4. router.push to "/sign-in"
      */
      
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
                       Verifying...
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
```

### Next Steps for You:
1. Create the `src/app/(auth)/verify/[username]/page.tsx` file and paste the skeleton.
2. Complete the `onSubmit` function in the "**YOUR TURN**" section to wire up the API request!

---

## Cheat Code #3: The Landing Page (`app/page.tsx`)

### The Beautiful Next.js Homepage
Now let's create a beautiful Landing Page introducing CourseCraft! We will add a Header with "Sign In/Up" options, an awesome Hero Section, and some feature highlights. 

Open `src/app/page.tsx` (the root page of your app) and **replace** everything inside with this template:

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* LOGO */}
          <div className="bg-[#1A237E] p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">
            CourseCraft
          </span>
        </div>
        
        {/* ACTION BUTTONS */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link 
            href="/sign-in" 
            className="text-sm font-semibold text-gray-600 hover:text-[#1A237E] transition-colors"
          >
            Sign In
          </Link>
          <Link href="/sign-up">
            <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-5 py-2 sm:px-6 shadow-md transition-all">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8">
            Master new skills with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A237E] to-blue-500">
              CourseCraft
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Join thousands of students learning from the best instructors. Explore interactive courses, track your progress, and achieve your goals today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              {/* YOUR TURN: Test out these buttons! They should take you to your beautiful Sign Up page */}
              <Button size="lg" className="w-full h-14 px-8 text-lg font-semibold bg-[#2442AD] hover:bg-[#1A237E] rounded-full shadow-lg hover:shadow-xl transition-all">
                Start Learning Now
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg font-semibold rounded-full border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* HIGHLIGHTS SECTION */}
      <section id="features" className="w-full py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-[#1A237E]">
              Why choose CourseCraft?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="p-4 bg-blue-100 rounded-2xl shadow-sm">
                <BookOpen className="h-8 w-8 text-[#2442AD]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Diverse Courses</h3>
              <p className="text-gray-500 font-medium">Learn from a vast library of expert-led topics ranging from programming to design.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="p-4 bg-purple-100 rounded-2xl shadow-sm">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Community Driven</h3>
              <p className="text-gray-500 font-medium">Connect with instructors and peers to ask questions and share your knowledge.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="p-4 bg-emerald-100 rounded-2xl shadow-sm">
                <Trophy className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Earn Certificates</h3>
              <p className="text-gray-500 font-medium">Complete courses and earn certificates to showcase your new skills to employers.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-slate-900 py-10 text-center">
        <p className="text-slate-400 font-medium tracking-wide text-sm">
          © {new Date().getFullYear()} CourseCraft. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
```

### Next Steps for You:
1. Open `src/app/page.tsx`
2. **Delete** all the default Next.js code inside it.
3. **Paste** the above skeleton.
4. Click around and check out the Sign Up routing!

---

## Cheat Code #4: The Sign In Page (`app/(auth)/sign-in/page.tsx`)

### Entering the Portal
Now let's complete the authentication loop by letting registered users log in! Since you're using `next-auth`, we will use the `signIn` function provided by `next-auth/react` to securely authenticate against your backend.

Create the file `src/app/(auth)/sign-in/page.tsx` and **paste** this beautiful 2-column skeleton:

```tsx
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

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form with your Zod schema
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "", // Can be email or username
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    
    // YOUR TURN: Call the signIn method from NextAuth!
    // 1. Use signIn("credentials", { ... })
    // 2. Pass identifier and password inside the object, along with redirect: false
    // 3. Handle the result (check result?.error)
    // 4. If success, toast a welcome message and router.push to "/dashboard" or "/"
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

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
      setIsSubmitting(false);
    }
  };

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
```

### Next Steps for You:
1. Create the `src/app/(auth)/sign-in/page.tsx` file.
2. Paste the skeleton inside it.
3. Test your full flow: Landing Page -> Sign In -> NextAuth Authentication!

---

## Cheat Code #5: The Student Dashboard (`app/(app)/dashboard/page.tsx`)

### Your Learning Hub
Welcome to Phase 2! This is the protected dashboard where users land after successfully signing in. We're stepping away from the 2-column auth layout and building a sleek, modern **Sidebar + Main Content** dashboard layout.

*Note: Since this is a protected route, we'll use `next-auth/react` to grab the session data and greet the student!*

Create the file `src/app/(app)/dashboard/page.tsx` and **paste this beautiful skeleton**:

```tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Compass, User as UserIcon, LogOut, PlayCircle, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Dummy data for our UI so we can see the layout!
const dummyEnrolledCourses = [
  { id: "1", title: "Advanced React Patterns", instructor: "Hitesh Choudhary", progress: 45, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop" },
  { id: "2", title: "Next.js 15 Masterclass", instructor: "Hitesh Choudhary", progress: 12, thumbnail: "https://images.unsplash.com/photo-1627398225056-ee1a03e61f23?q=80&w=800&auto=format&fit=crop" }
];

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Show a nice loading state while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E]"></div>
        <p className="mt-4 text-[#1A237E] font-medium">Loading your portal...</p>
      </div>
    );
  }

  // If not authenticated, the Next.js middleware should kick them to sign-in, but just in case:
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">
        Access Denied. Please Sign In.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm fixed h-full z-10">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">CourseCraft</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#1A237E] rounded-xl font-semibold shadow-sm">
            <BookOpen className="h-5 w-5" />
            My Learning
          </Link>
          <Link href="/courses" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <Compass className="h-5 w-5" />
            Explore Courses
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <UserIcon className="h-5 w-5" />
            Profile
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          {/* Become Instructor CTA */}
          <Link href="/become-instructor">
             <Button variant="outline" className="w-full justify-start text-[#1A237E] border-slate-300 hover:border-[#1A237E] hover:bg-blue-50 transition-colors shadow-sm">
               <PlusCircle className="mr-2 h-4 w-4" />
               Teach on CourseCraft
             </Button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto w-full">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search your courses..." 
              className="pl-10 h-11 bg-white border-slate-200 rounded-full shadow-sm focus-visible:ring-[#1A237E]" 
            />
          </div>
          
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center font-bold shadow-md">
               {session?.user?.username?.charAt(0).toUpperCase() || "U"}
             </div>
          </div>
        </div>

        {/* WELCOME SECTION */}
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back, <span className="text-[#1A237E]">{session?.user?.username || "Student"}</span>! 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Pick up right where you left off.</p>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="flex gap-4 sm:gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="px-4 text-center">
               <span className="block text-2xl font-bold text-[#1A237E]">{dummyEnrolledCourses.length}</span>
               <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Courses</span>
             </div>
             <div className="w-px bg-slate-200"></div>
             <div className="px-4 text-center">
               <span className="block text-2xl font-bold text-emerald-600">0</span>
               <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed</span>
             </div>
          </div>
        </header>

        {/* ENROLLED COURSES GRID */}
        {dummyEnrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dummyEnrolledCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col">
                
                {/* Thumbnail */}
                <div className="h-44 bg-slate-200 relative overflow-hidden shrink-0">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#1A237E]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="text-white h-14 w-14 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Course Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{course.instructor}</p>
                  
                  {/* Progress Bar (Pushed to bottom using mt-auto) */}
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-[#1A237E] rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-[#1A237E]">{course.progress}%</span>
                    </div>

                    <Link href={`/learn/${course.id}`}>
                      <Button className="w-full mt-4 bg-slate-900 hover:bg-[#1A237E] text-white rounded-xl shadow-md transition-all">
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE (If they have no courses) */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Compass className="h-12 w-12 text-[#1A237E]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Your learning journey awaits!</h3>
            <p className="text-slate-500 mt-3 max-w-md text-center text-lg">You haven't enrolled in any courses yet. Explore our catalog and discover something amazing to learn today.</p>
            <Link href="/courses" className="mt-8">
              <Button size="lg" className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-10 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                Explore The Catalog
              </Button>
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
```

### Next Steps for You:
1. Make sure you have a `SessionProvider` wrapping your layout if you haven't done that yet! (This lets `useSession` work client-side).
   *To do this*: Create a generic `AuthProvider.tsx` in a `context` folder that exports `<SessionProvider>{children}</SessionProvider>`, and wrap `{children}` with it inside your global `app/layout.tsx`.
2. Create the file `src/app/(app)/dashboard/page.tsx`
3. Paste the skeleton!

---

## Cheat Code #6: The Master Plan (Course Display & Enrollment Flow)

### The Roadmap
We just discussed allowing public users to see courses, while seamlessly restricting enrollment. Here is our 3-phase journey to build this:

#### 🏗️ Phase 1: Public Course Listing (Landing Page)
1. **The Component:** Build a `CourseCard` (`src/components/CourseCard.tsx`) to show the Thumbnail, Title, and Instructor. 
2. **The Page:** Update `src/app/page.tsx` to fetch the published courses directly from the database and map them into the `CourseCard` grid. Since it's public, anyone can see it!

#### 📖 Phase 2: Course Details Page
1. **The Details:** Create `src/app/courses/[courseId]/page.tsx` to fetch a specific course and display its full syllabus and instructor bio.

#### 🔐 Phase 3: Secure Enrollment
1. **The Shield (`EnrollButton`):** Build a UI button using `useSession`. If a user is logged out, clicking it will seamlessly redirect them to `/sign-in` rather than attempting an API call.
2. **The Vault (Backend):** You **already perfectly built** `POST /api/courses/[courseId]/enroll` to check `auth()` and update `enrolledCourses`! Your backend is fully secured.

---

## Cheat Code #7: The `CourseCard` Component (Phase 1)

### Building the Display Card
We need a reusable UI component to represent a single course! Let's build a stunning card using ShadCN and Tailwind.

Create the file `src/components/CourseCard.tsx` and **paste this code**:

```tsx
import Link from "next/link";
import { BookOpen, Users, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  courseId: string;
  title: string;
  description: string;
  instructorName: string;
  thumbnail: string;
  chaptersCount?: number;
}

export function CourseCard({ courseId, title, description, instructorName, thumbnail, chaptersCount = 0 }: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      
      {/* Thumbnail */}
      <div className="h-48 bg-slate-200 relative overflow-hidden shrink-0">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
            <BookOpen className="h-10 w-10 text-indigo-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-[#1A237E]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="text-white h-16 w-16 drop-shadow-lg" />
        </div>
      </div>
      
      {/* Course Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-[#1A237E] transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{description}</p>
        
        {/* Bottom Metadata */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            <Users className="h-4 w-4 shrink-0 text-[#1A237E]" />
            <span className="truncate">{instructorName}</span>
          </div>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md shrink-0">
            {chaptersCount} Lessons
          </div>
        </div>

        {/* Action */}
        <Link href={`/courses/${courseId}`} className="mt-4 block">
          <Button className="w-full bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-xl shadow-md transition-all">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

### Next Steps for You:
1. Since we haven't created it yet, **create** the `CourseCard.tsx` file inside your `src/components/` folder.
2. Grab the code above and paste it in! We'll use this everywhere we need to list a course.

---

## Cheat Code #8: The Public Landing Page (Phase 1)

### Making Courses Public
It's time to connect the dots. We need to convert your Landing Page into a **Server Component**. This allows it to fetch the published courses instantly from the database before sending the HTML to the browser!

Open `src/app/page.tsx`, completely **DELETE** the old content, and **replace** it with this:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react";

// For auth detection
import { auth } from "@/auth";

// Our Database Imports!
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Course";

// Our new Component from Cheat Code #7!
import { CourseCard } from "@/components/CourseCard";

// NOTE: No "use client" anymore! 
// This makes it a powerful Server Component. Wait until you see how fast this fetches!

export default async function Home() {
  // 1. Fetch Session (To conditionally show "Dashboard" vs "Sign In")
  const session = await auth();

  // 2. Fetch Courses from Database (Server-side rendering!)
  await dbConnect();
  
  // Notice we only fetch PUBLISHED courses!
  const courses = await CourseModel.find({ isPublished: true })
    .populate("instructor", "username email")
    .sort({ createdAt: -1 })
    // Limit to 6 for the landing page grid so we don't overwhelm users
    .limit(6) 
    .lean(); // .lean() makes the query faster and returns pure JS objects

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#1A237E] p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-[#1A237E] tracking-tight">
            CourseCraft
          </span>
        </div>
        
        {/* Navigation - Conditionally Rendered based on Auth! */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link href="#courses-section" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-[#1A237E] transition-colors">
            Explore Courses
          </Link>
          
          {session ? (
             <Link href="/dashboard">
              <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-5 py-2 sm:px-6 shadow-md transition-all">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-semibold text-gray-600 hover:text-[#1A237E] transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-[#1A237E] hover:bg-[#2442AD] text-white rounded-full px-5 py-2 sm:px-6 shadow-md transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8">
            Master new skills with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A237E] to-blue-500">
              CourseCraft
            </span>
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Join thousands of students learning from the best instructors. Explore interactive courses, track your progress, and achieve your goals today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#courses-section">
              <Button size="lg" className="w-full h-14 px-8 text-lg font-semibold bg-[#2442AD] hover:bg-[#1A237E] rounded-full shadow-lg transition-all">
                Explore The Catalog
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* DYNAMIC PUBLIC COURSES GRID SECTION */}
      <section id="courses-section" className="w-full py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1A237E] sm:text-4xl">
                Featured Courses
              </h2>
              <p className="mt-4 text-lg text-gray-500 font-medium">
                Start your journey with our top-rated courses without signing up!
              </p>
            </div>
            
            {/* 
              Future Upgrade: A dedicated `/courses` catalog page! 
              For now we just link out showing intent.
            */}
            <Link href="/courses">
               <Button variant="ghost" className="text-[#1A237E] font-bold hover:bg-blue-50 rounded-full hidden sm:flex">
                 View All Courses <ChevronRight className="ml-2 w-4 h-4" />
               </Button>
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => {
                 // Safely extract the instructor's username or fallback to email
                 const instId = course.instructor;
                 const instructorName = typeof instId === 'object' && instId !== null 
                    ? (instId.username || instId.email || 'Instructor') 
                    : 'Instructor';

                 return (
                   <CourseCard 
                     key={course._id.toString()}
                     courseId={course._id.toString()}
                     title={course.title}
                     description={course.description}
                     instructorName={instructorName}
                     thumbnail={course.thumbnail}
                     chaptersCount={course.chapters?.length || 0}
                   />
                 );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
               <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
               <h3 className="text-2xl font-bold text-slate-600">No courses available yet</h3>
               <p className="text-slate-500 mt-2">Instructors are working on amazing content!</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-10 text-center">
        <p className="text-slate-400 font-medium tracking-wide text-sm">
          © {new Date().getFullYear()} CourseCraft. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
```

### Next Steps for You (The Magic Moment! ✨):
1. Create `src/components/CourseCard.tsx` and paste the snippet from Cheat Code #7.
2. Open `src/app/page.tsx` and overwrite everything with the code from Cheat Code #8.
3. Once done, open a **Private/Incognito** browser window and navigate to `http://localhost:3000`. You will see all your courses fetched straight from the database... without needing to log in at all!

Try it out and let me know when you've got the Public Landing page working!
