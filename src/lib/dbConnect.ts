import mongoose from "mongoose";

type ConnectionObject = {
    isconnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {

    if (connection.isconnected) {
        console.log("Using existing database")
        return
    }

    try {
        console.log("Attempting to connect to DB...");
        console.log("URI provided:", !!process.env.MONGODB_URI); // Log true/false only
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})
        connection.isconnected = db.connections[0].readyState
        console.log("Database connected")
    } catch (error) {
        console.log("Error connecting to database", error)
        process.exit(1);
    }

}

export default dbConnect