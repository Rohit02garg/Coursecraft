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