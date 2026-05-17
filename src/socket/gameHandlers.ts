import { Server, Socket } from "socket.io";
import { getRoom, Room, updateRoom } from "../store/rooms";
import { evaluateSolution, getRandomChallenge } from "../services/judgeServices";
import { Challenge } from "../models/Challenge";

export async function gameHandlers(io: Server, socket: Socket) {
  socket.on("game:start", async (data: { code: string }) => {
    console.log("game:start recebido", data);
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
    console.log("challenge:", challenge);
    const roundEndsAt = new Date(Date.now() + room.timeLimit * 1000);
    room.roundEndsAt = roundEndsAt;
    updateRoom(room.code, {
      status: "playing",
      currentChallenge: challenge?._id.toString(),
      roundEndsAt,
    });
    const timer = setTimeout(() => {
      handleRoundEnd(io, room.code)
    }, room.timeLimit * 1000)
    updateRoom(room.code, {roundTimer: timer});
    console.log("sockets na sala:", await io.in(room.code).fetchSockets().then(s => s.map(s => s.id)))
    io.to(room.code).emit("game:started", challenge, roundEndsAt)
    console.log("emitido")
  });
  handleSubmit(io, socket)
}
export async function handleRoundEnd(io: Server, code: string) {
  const room = getRoom(code);
  if (!room) {
    return "errorHandleEndNotfoundRoom";
  }
  if (room.roundTimer) {
  clearTimeout(room.roundTimer);
  updateRoom(code, { roundTimer: null });
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
  const resetPlayers = room.players.map(p => ({ ...p, solvedCurrent:false}))
  updateRoom(code, {
    solvedCount: 0,
    currentChallenge: challenge?.id.toString(),
    roundEndsAt: roundEndsAt,
    players: resetPlayers,
  });

  io.to(code).emit("game:roundEnd");
  const timer = setTimeout(() => {
    handleRoundEnd(io, room.code);
  }, room.timeLimit * 1000);
  updateRoom(room.code, {roundTimer:timer})
}

export async function handleSubmit(io: Server, socket: Socket){
  socket.on("game:submit", async(data: {code: string, solution: string, language: "javascript" | "python"})=>{
    const room = getRoom(data.code)
    if (!room){
      socket.emit("game:error", "roomNotFound")
      return
    }

    const player = room.players.find(p => p.socketId == socket.id)
    if (!player){
      socket.emit("game:error", "playerNotFound")
      return
    }
    if (player.solvedCurrent){
      socket.emit("game:error", "alreadySolved")
      return
    }
    const challenge = await Challenge.findById(room.currentChallenge)
    if (!challenge) {
      socket.emit("game:error", "challengeNotFound")
      return
      }
    const result = await evaluateSolution(challenge, data.solution, data.language)

    if (!result.correct){
      socket.emit("game:wrong")
      return
    }
    // Acerto: 10 pontos base
//- Bônus de velocidade: até 10 pontos extras proporcionais a quantidade de pessoas que já acertaram (mínimo de 2 pontos extras)
    player.solvedCurrent = true
    let score = 10
    let bonus = 10 + ( -2 * room.solvedCount)
    if (bonus<2){
      score += 2
    }else{
      score += bonus
    }
    player.score += score
    const updatedRoom = updateRoom(room.code, {
      solvedCount: room.solvedCount+1,
      players: room.players
    })
    io.to(room.code).emit("game:correct", {
      username: player.username,
      score: player.score,
      players: updatedRoom?.players
    })
    if (updatedRoom?.solvedCount == room.players.length){
      handleRoundEnd(io, room.code)
    }
  })
}
