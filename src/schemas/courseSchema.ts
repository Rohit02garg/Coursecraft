import { z } from "zod";

export const chapterSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    content: z.string().min(3, "Content must be at least 3 characters long"),
    videoUrl: z.string().url("Invalid video URL"),
    isFree: z.boolean().default(false),
})

export const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().min(3, "Description must be at least 3 characters long"),
    thumbnail: z.string().url("Invalid thumbnail URL"),
    isPublished: z.boolean().default(false),
    chapters: z.array(chapterSchema)
})