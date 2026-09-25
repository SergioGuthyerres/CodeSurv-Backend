import { Server, Socket } from "socket.io";
import { getRoom, Room, updateRoom } from "../store/rooms";
import { evaluateSolution, getRandomChallenge } from "../services/judgeServices";
import { Challenge } from "../models/Challenge";

const MAX_SOLUTION_LENGTH = 8000;

export async function gameHandlers(io: Server, socket: Socket) {
  socket.on("game:start", async (data: { code: string }) => {
    try {
      const room = getRoom(data.code);
      if (!room) {
        socket.emit("game:error", "roomNotFound");
        return;
      }
      const owner = room.players.find((p) => p.isOwner);
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
      if (!challenge) {
        socket.emit("game:error", "noChallenge");
        return;
      }

      const roundEndsAt = new Date(Date.now() + room.timeLimit * 1000);
      updateRoom(room.code, {
        status: "playing",
        currentChallenge: challenge._id.toString(),
        roundEndsAt,
      });

      const timer = setTimeout(() => {
        handleRoundEnd(io, room.code);
      }, room.timeLimit * 1000);
      updateRoom(room.code, { roundTimer: timer });

      io.to(room.code).emit("game:started", { challenge, roundEndsAt });
    } catch (err) {
      console.error("Erro em game:start:", err);
      socket.emit("game:error", "internalError");
    }
  });

  handleSubmit(io, socket);
}

export async function handleRoundEnd(io: Server, code: string) {
  const room = getRoom(code);
  if (!room) return;

  // Clear timer immediately to prevent double-execution
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    updateRoom(code, { roundTimer: null });
  }

  try {
    for (const player of room.players) {
      if (player.score >= room.pointsToWin) {
        updateRoom(code, { status: "finished" });
        io.to(code).emit("game:end", {
          winner: player.username,
          players: room.players,
        });
        return;
      }
    }

    const challenge = await getRandomChallenge();
    if (!challenge) {
      io.to(code).emit("game:error", "noChallenge");
      return;
    }

    const roundEndsAt = new Date(Date.now() + room.timeLimit * 1000);
    const resetPlayers = room.players.map((p) => ({ ...p, solvedCurrent: false }));

    updateRoom(code, {
      solvedCount: 0,
      currentChallenge: challenge._id.toString(),
      roundEndsAt,
      players: resetPlayers,
    });

    io.to(code).emit("game:roundEnd", { challenge, roundEndsAt, players: resetPlayers });

    const timer = setTimeout(() => {
      handleRoundEnd(io, code);
    }, room.timeLimit * 1000);
    updateRoom(code, { roundTimer: timer });
  } catch (err) {
    console.error("Erro em handleRoundEnd:", err);
  }
}

export async function handleSubmit(io: Server, socket: Socket) {
  socket.on(
    "game:submit",
    async (data: { code: string; solution: string; language: "javascript" | "python" }) => {
      try {
        if (
          !data ||
          typeof data.code !== "string" ||
          typeof data.solution !== "string" ||
          (data.language !== "javascript" && data.language !== "python")
        ) {
          socket.emit("game:error", "invalidPayload");
          return;
        }

        if (data.solution.length > MAX_SOLUTION_LENGTH) {
          socket.emit("game:error", "solutionTooLarge");
          return;
        }

        const room = getRoom(data.code);
        if (!room) {
          socket.emit("game:error", "roomNotFound");
          return;
        }

        const player = room.players.find((p) => p.socketId === socket.id);
        if (!player) {
          socket.emit("game:error", "playerNotFound");
          return;
        }
        if (player.solvedCurrent) {
          socket.emit("game:error", "alreadySolved");
          return;
        }

        const challenge = await Challenge.findById(room.currentChallenge);
        if (!challenge) {
          socket.emit("game:error", "challengeNotFound");
          return;
        }

        const result = await evaluateSolution(challenge, data.solution, data.language);
        if (!result.correct) {
          socket.emit("game:wrong", { error: result.error });
          return;
        }

        // 10 base points + speed bonus (up to 10 extra, minimum 2)
        player.solvedCurrent = true;
        const bonus = Math.max(2, 10 - 2 * room.solvedCount);
        player.score += 10 + bonus;

        const updatedRoom = updateRoom(room.code, {
          solvedCount: room.solvedCount + 1,
          players: room.players,
        });

        io.to(room.code).emit("game:correct", {
          username: player.username,
          score: player.score,
          players: updatedRoom?.players,
        });

        if (updatedRoom && updatedRoom.solvedCount >= room.players.length) {
          await handleRoundEnd(io, room.code);
        }
      } catch (err) {
        console.error("Erro em game:submit:", err);
        socket.emit("game:error", "internalError");
      }
    },
  );
}
