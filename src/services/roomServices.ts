import {
  addPlayer,
  createRoom,
  getRoom,
  removePlayer,
  roomLen,
} from "../store/rooms";
import { Room } from "../store/rooms";

type CreateRoomResult =
  | { success: true; room: Room }
  | { success: false; error: string };

type JoinRoomResult =
  | { success: true; room: Room }
  | { success: false; error: string };

function usernameValidator(username: string): boolean {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  if (trimmed.length < 4 || trimmed.length > 12) return false;
  return /^[a-zA-Z0-9]+$/.test(trimmed);
}

export function generateRoomCode() {
  function generateCode(tamanho: number = 4): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const array = new Uint8Array(tamanho);
    crypto.getRandomValues(array);
    return Array.from(array, (n) => characters[n % characters.length]).join("");
  }
  let code = generateCode();
  while (getRoom(code)) {
    code = generateCode();
  }
  return code;
}

export function serviceCreateRoom(
  socketId: string,
  username: string,
  maxPlayers: number,
  password: string | null,
  timeLimit: number,
  pointsToWin: number,
  solvedCount: number,
): CreateRoomResult {
  if (typeof maxPlayers !== "number" || maxPlayers < 2 || maxPlayers > 20) {
    return { success: false, error: "invalidMaxPlayers" };
  }
  if (roomLen() >= 300) {
    return { success: false, error: "roomLimit" };
  }
  if (!usernameValidator(username)) {
    return { success: false, error: "invalidUsername" };
  }
  if (typeof timeLimit !== "number" || timeLimit > 1000 || timeLimit < 60) {
    return { success: false, error: "invalidTimeLimit" };
  }
  if (typeof pointsToWin !== "number" || pointsToWin > 500 || pointsToWin < 80) {
    return { success: false, error: "invalidPointsToWin" };
  }
  const code = generateRoomCode();
  const room = createRoom(
    code,
    socketId,
    username,
    maxPlayers,
    password,
    timeLimit,
    pointsToWin,
    solvedCount,
  );
  return { success: true, room };
}

export function joinRoom(
  code: string,
  socketId: string,
  username: string,
  password: string | null,
): JoinRoomResult {
  if (!usernameValidator(username)) {
    return { success: false, error: "invalidUsername" };
  }
  return addPlayer(code, socketId, username, password);
}

export function leaveRoom(socketId: string) {
  return removePlayer(socketId);
}

export function getRoomInfo(code: string) {
  return getRoom(code);
}
