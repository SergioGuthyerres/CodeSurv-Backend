import Fastify from "fastify";
import cors from "@fastify/cors";

import { Server } from "socket.io";
const PORT = 3000;
async function start() {
  const fastify = Fastify({ logger: true });

  const io = new Server(fastify.server, {
    cors: { origin: "http://localhost/3000" },
  });

  await fastify.listen({ port: PORT });
}
start().catch((err) => {
  console.log(err);
  process.exit(1);
});
