import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface Chapter extends Document {
    title: string
    content: string
    videoUrl: string
}

const ChapterSchema: Schema<Chapter> = new Schema({
    title: {
        type: String,
        required: [true, "title is required"]
    },
    content: {
        type: String,
        required: [true, "content is required"]
    },
    videoUrl: {
        type: String,
        required: [true, "videoUrl is required"]
    }
})

export interface Course extends Document {
    instructor: mongoose.Schema.Types.ObjectId
    title: string
    description: string
    thumbnail: string
    isPublished: boolean
    chapters: Chapter[]
    createdAt: Date
    updatedAt: Date
}

const CourseSchema: Schema<Course> = new Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "instructor is required"]
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
    description: {
        type: String,
        required: [true, "description is required"]
    },
    thumbnail: {
        type: String,
        required: [true, "thumbnail is required"]
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    chapters: {
        type: [ChapterSchema],
        required: [true, "chapters is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const CourseModel = (mongoose.models.Course as mongoose.Model<Course>) || mongoose.model<Course>("Course", CourseSchema);
export default CourseModel;