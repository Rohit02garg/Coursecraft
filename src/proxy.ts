import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // Yeh routes sirf logged-in users ke liye hain
    const protectedRoutes = ["/dashboard", "/learn", "/instructor", "/become-instructor", "/profile"]
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }
})

export const config = {
    // API routes, static files aur images ko skip karo
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
