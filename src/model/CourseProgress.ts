import mongoose, { Schema, Document } from "mongoose";

export interface CourseProgress extends Document {
    userId: mongoose.Schema.Types.ObjectId
    courseId: mongoose.Schema.Types.ObjectId
    completedChapters: mongoose.Schema.Types.ObjectId[]
    isCompleted: boolean
}

const CourseProgressSchema: Schema<CourseProgress> = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    completedChapters: [{
        type: mongoose.Schema.Types.ObjectId,
        // No ref here because chapters are subdocuments of Course, not a separate collection
    }],
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const CourseProgressModel = (mongoose.models.CourseProgress as mongoose.Model<CourseProgress>) || mongoose.model<CourseProgress>("CourseProgress", CourseProgressSchema)
export default CourseProgressModel
