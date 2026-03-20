import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codesurv";

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("Mongodb conectado:", mongoose.connection.name);
}
