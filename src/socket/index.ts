import { Server } from "socket.io";
export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log("Cliente conectou:", socket.id);
  });
}
