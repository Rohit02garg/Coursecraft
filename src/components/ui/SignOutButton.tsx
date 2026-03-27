"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignOutButton() {
    return (
        <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-400 rounded-xl transition-all"
        >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
    )
}
