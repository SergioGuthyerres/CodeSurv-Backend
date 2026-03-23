import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerSocketHandlers } from "./socket";
import { Server } from "socket.io";
import { connectDB } from "./db";
const PORT = Number(process.env.PORT) || 3000;
async function start() {
  const fastify = Fastify({ logger: true });

  const io = new Server(fastify.server, {
    cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173" },
  });

  await connectDB();
  registerSocketHandlers(io);
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
}
start().catch((err) => {
  console.error(err);
  process.exit(1);
});
