import { Server, Socket } from "socket.io";
import { getRoom, Room, updateRoom } from "../store/rooms";
import { getRandomChallenge } from "../services/judgeServices";
import { Challenge } from "../models/Challenge";

export default async function gameHandlers(io: Server, socket: Socket) {
  socket.on("game:start", async (data: { code: string }) => {
    const room = getRoom(data.code);
    if (!room) {
      socket.emit("game:error", "roomNotFound");
      return;
    }
    const owner = room.players.find((player) => player.isOwner === true);
    if (!owner) {
      socket.emit("game:error", "ownerNotFound");
      return;
    }
    if (owner.socketId !== socket.id) {
      socket.emit("game:error", "permissionDenied");
      return;
    }
    if (room.status !== "waiting") {
      socket.emit("game:error", "invalidStatus");
      return;
    }
    const challenge = await getRandomChallenge();
    const roundEndsAt = new Date(Date.now() + room.timeLimit * 1000);
    room.roundEndsAt = roundEndsAt;
    updateRoom(room.code, {
      status: "playing",
      currentChallenge: challenge?.id,
      roundEndsAt,
    });
    setTimeout(() => {
      handleRoundEnd(io, room.code);
    }, room.timeLimit * 1000);
    io.to(room.code).emit("game:started", challenge, roundEndsAt);
  });
}
export async function handleRoundEnd(io: Server, code: string) {
  const room = getRoom(code);
  if (!room) {
    return "errorHandleEndNotfoundRoom";
  }

  for (const player of room.players) {
    if (player.score >= room.pointsToWin) {
      updateRoom(code, { status: "finished" });
      const winner = player;
      io.to(code).emit("game:end", {
        winner: winner.username,
        players: room.players,
      });
      return;
    }
  }
  const challenge = await getRandomChallenge();
  const roundEndsAt = new Date(Date.now() + room.timeLimit * 1000);
  updateRoom(code, {
    solvedCount: 0,
    currentChallenge: challenge?.id,
    roundEndsAt: roundEndsAt,
  });
  for (const player of room.players) {
    player.solvedCurrent = false;
  }
  io.to(code).emit("game:roundEnd");
  setTimeout(() => {
    handleRoundEnd(io, room.code);
  }, room.timeLimit * 1000);
}
