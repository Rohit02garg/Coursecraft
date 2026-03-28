"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
    /** Fallback URL if there is no browser history (e.g. user landed directly on the page) */
    fallbackHref?: string;
    label?: string;
    /** Visual variant – 'subtle' (default) looks like a small text link; 'ghost' renders a pill-shaped button */
    variant?: "subtle" | "ghost";
    className?: string;
}

export default function BackButton({
    fallbackHref = "/dashboard",
    label = "Back",
    variant = "subtle",
    className = "",
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // window.history.length ≤ 1 means the user opened this page directly (new tab, bookmark, etc.)
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    if (variant === "ghost") {
        return (
            <button
                onClick={handleBack}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 ${className}`}
            >
                <ChevronLeft className="h-4 w-4" />
                {label}
            </button>
        );
    }

    // Default: subtle text-link style used across most pages
    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors ${className}`}
        >
            <ChevronLeft className="h-3 w-3 mr-1" />
            {label}
        </button>
    );
}
