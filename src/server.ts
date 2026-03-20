import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerSocketHandlers } from "./socket";
import { Server } from "socket.io";
const PORT = 3000;
async function start() {
  const fastify = Fastify({ logger: true });

  const io = new Server(fastify.server, {
    cors: { origin: "*" },
  });
  registerSocketHandlers(io);
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
}
start().catch((err) => {
  console.log(err);
  process.exit(1);
});
