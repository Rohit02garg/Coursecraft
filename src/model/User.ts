import mongoose, { Schema, Document } from "mongoose"

export interface User extends Document {
    username: string
    email: string
    password: string
    verifyCode: string
    verifyCodeExpiry: Date
    isVerified: boolean
    role: "STUDENT" | "INSTRUCTOR"
    enrolledCourses: mongoose.Schema.Types.ObjectId[]
}

const UserSchema: Schema<User> = new Schema({

    username: {
        type: String,
        required: [true, "username is required"],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/.+\@.+\..+/, 'please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    verifyCode: {
        type: String,
        required: [true, "verifyCode is required"]
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "verifyCodeExpiry is required"]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["STUDENT", "INSTRUCTOR"],
        default: "STUDENT"
    },
    enrolledCourses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Course"
    }
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);
export default UserModel;