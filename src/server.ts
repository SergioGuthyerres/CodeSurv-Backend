import Fastify from "fastify";
import cors from "@fastify/cors";
const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "http://localhost:5173",
});

fastify.get("/", async (request, reply) => {
  return { status: "Backend do CodeSurv operante!" };
});
// depois irei refatorar para encaixar o socket.io
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Servidor rodando na porta 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
