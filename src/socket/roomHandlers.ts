import { Server, Socket } from "socket.io";
import { joinRoom, serviceCreateRoom } from "../services/roomServices";
import { getRoomsPublic, removePlayer } from "../store/rooms";

interface CreateRoomData {
  username: string;
  maxPlayers: number;
  password: string | null;
  timeLimit: number;
  pointsToWin: number;
}

interface JoinRoomData {
  code: string;
  password: string | null;
  username: string;
}

function handleLeave(io: Server, socket: Socket) {
  const result = removePlayer(socket.id);
  if (!result.room) return;
  if (result.roomEmpty) return;
  if (result.wasPlaying) {
    io.to(result.room.code).emit("game:interrupted", { socketId: socket.id });
  }
  io.to(result.room.code).emit("room:userLeft", { socketId: socket.id });
  io.to(result.room.code).emit("room:updated", result.room);
}

export function roomHandlers(io: Server, socket: Socket) {
  socket.on("room:create", (data: CreateRoomData) => {
    if (!data?.username) {
      socket.emit("room:error", "invalidUsername");
      return;
    }
    const result = serviceCreateRoom(
      socket.id,
      data.username,
      data.maxPlayers,
      data.password ?? null,
      data.timeLimit,
      data.pointsToWin,
      0,
    );
    if (!result.success) {
      socket.emit("room:error", result.error);
      return;
    }
    socket.join(result.room.code);
    socket.emit("room:created", result.room);
  });

  socket.on("room:join", (data: JoinRoomData) => {
    if (!data?.username) {
      socket.emit("room:error", "invalidUsername");
      return;
    }
    const result = joinRoom(data.code, socket.id, data.username, data.password ?? null);
    if (!result.success) {
      socket.emit("room:error", result.error);
      return;
    }
    socket.join(result.room.code);
    socket.emit("room:joined", result.room);
    io.to(result.room.code).emit("room:updated", result.room);
  });

  socket.on("room:list", () => {
    socket.emit("room:list", getRoomsPublic());
  });

  socket.on("disconnect", () => handleLeave(io, socket));
  socket.on("room:leave", () => handleLeave(io, socket));
}
