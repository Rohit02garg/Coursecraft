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
CourseSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const courseId = this._id;

        // 1. Delete all CourseProgress documents tied to this course
        await mongoose.model('CourseProgress').deleteMany({ courseId });
        // 2. Remove this course's ID from every User's 'enrolledCourses' array
        await mongoose.model('User').updateMany(
            { enrolledCourses: courseId },
            { $pull: { enrolledCourses: courseId } } // $pull removes the matching ID from arrays
        );
        next(); // Tell Mongoose it's safe to proceed with the actual Course deletion
    } catch (error: any) {
        next(error); // If something fails, abort the deletion process
    }
});

const CourseModel = (mongoose.models.Course as mongoose.Model<Course>) || mongoose.model<Course>("Course", CourseSchema);


export default CourseModel;