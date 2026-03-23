import { Server } from "socket.io";
import { roomHandlers } from "./roomHandlers";
export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    roomHandlers(io, socket);
  });
}
