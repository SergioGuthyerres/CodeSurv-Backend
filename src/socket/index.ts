import { Server } from "socket.io";
export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log("Cliente conectou:", socket.id);

    socket.on("ping:test", () => {
      console.log("ping recebido de", socket.id);
      socket.emit("pong:test", {
        message: "server vivo",
        socketId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log("cliente desconectou", socket.id);
    });
  });
}
