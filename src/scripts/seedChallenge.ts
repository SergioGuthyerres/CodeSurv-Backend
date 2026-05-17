import mongoose from "mongoose";
import { connectDB } from "../db";
import { Challenge } from "../models/Challenge";

async function seed() {
    await connectDB();

    await Challenge.create(
        []
        )
    console.log("inserido")
    await mongoose.disconnect()
    process.exit(0);
}

seed();
