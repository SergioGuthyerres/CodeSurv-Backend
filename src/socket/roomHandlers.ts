import { Server, Socket } from "socket.io";
import { joinRoom, serviceCreateRoom } from "../services/roomServices";

interface CreateRoomData {
  username: string;
  maxPlayers: number;
  password: string | null;
}
interface JoinRoomData {
  code: string;
  password: string;
  username: string;
}

export function roomHandlers(io: Server, socket: Socket) {
  socket.on("room:create", (data: CreateRoomData) => {
    if (!data?.username) {
      socket.emit("room:error", "invalideUsername");
      return;
    }
    const result = serviceCreateRoom(
      socket.id,
      data.username,
      data.maxPlayers,
      data.password,
    );
    if (!result.success) {
      socket.emit("room:error", result.error);
      return;
    }

    socket.join(result.room?.code);
    socket.emit("room:created", result.room);
  });

  socket.on("room:join", (data: JoinRoomData) => {
    if (!data?.username) {
      socket.emit("room:error", "invalideUsername");
      return;
    }
    const result = joinRoom(data.code, socket.id, data.username, data.password);
    if (!result.success) {
      socket.emit("room:error", result.error);
      return;
    }
    socket.join(result.room?.code);
  });
}
