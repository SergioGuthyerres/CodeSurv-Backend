import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codesurv";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.info(`MongoDB conectado: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("Falha ao conectar com MongoDB:", err);
    process.exit(1);
  }
}
