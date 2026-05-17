import { Server } from "socket.io";
import { roomHandlers } from "./roomHandlers";
import { gameHandlers } from "./gameHandlers";
export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    roomHandlers(io, socket);
    gameHandlers(io, socket);
  });
}
