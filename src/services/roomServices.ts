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
  const trimmed = username.trim();

  if (trimmed.length < 4 || trimmed.length > 12) {
    return false;
  }

  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(trimmed);
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
    //funciona so pra mvp, depois pensar em como esse loop não crashar o server
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
): CreateRoomResult {
  if (maxPlayers < 2 || maxPlayers > 20) {
    return { success: false, error: "invalidMaxPlayers" };
  }
  if (roomLen() >= 300) {
    return { success: false, error: "roomLimit" };
  }
  if (!usernameValidator(username)) {
    return { success: false, error: "invalidUsername" };
  }
  if (timeLimit > 1000 || timeLimit < 60) {
    return { success: false, error: "invalidTimeLimt" };
  }
  if (pointsToWin > 500 || pointsToWin < 80) {
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
  const result = addPlayer(code, socketId, username, password);
  return result;
}

export function leaveRoom(socketId: string) {
  return removePlayer(socketId);
}
export function getRoomInfo(code: string) {
  return getRoom(code);
}
