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

export default function CourseCard({ courseId, title, description, instructorName, thumbnail, chaptersCount = 0 }: CourseCardProps) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all duration-300 group flex flex-col h-full hover:border-indigo-100">

            {/* Thumbnail */}
            <div className="h-44 bg-slate-50 relative overflow-hidden shrink-0 border-b border-slate-50">
                {thumbnail ? (
                    <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <BookOpen className="h-8 w-8 text-slate-200" />
                    </div>
                )}
            </div>

            {/* Course Info */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{title}</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 font-medium">{description}</p>

                {/* Bottom Metadata */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Users className="h-3 w-3 shrink-0" />
                        <span className="truncate">{instructorName}</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50/50 px-2.5 py-1 rounded-lg shrink-0">
                        {chaptersCount} Lessons
                    </div>
                </div>

                {/* Action */}
                <Link href={`/courses/${courseId}`} className="mt-6 block">
                    <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-11 text-sm font-bold shadow-sm transition-all">
                        Details
                    </Button>
                </Link>
            </div>
        </div>
    );
}