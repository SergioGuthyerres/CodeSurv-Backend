import {
  addPlayer,
  createRoom,
  getRoom,
  removePlayer,
  roomLen,
} from "../store/rooms";
function usernameValidator(username: string): boolean {
  const trimmed = username.trim();

  if (trimmed.length < 1 || trimmed.length > 12) {
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
    //funciona so pra mvp
    code = generateCode();
  }
  return code;
}

export function serviceCreateRoom(
  socketId: string,
  username: string,
  maxPlayers: number,
  password: string | null,
) {
  if (maxPlayers < 2 || maxPlayers > 20) {
    return { success: false, error: "invalidMaxPlayers" };
  }
  if (roomLen() >= 300) {
    return { success: false, error: "roomLimit" };
  }
  if (!usernameValidator(username)) {
    return { success: false, error: "invalidUsername" };
  }
  const code = generateRoomCode();
  const room = createRoom(code, socketId, username, maxPlayers, password);
  return { success: true, room };
}

export function joinRoom(
  code: string,
  socketId: string,
  username: string,
  password: string | null,
) {
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
