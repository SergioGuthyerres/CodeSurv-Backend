export interface Player {
  socketId: string;
  username: string;
  score: number;
  isOwner: boolean;
}

export interface Room {
  code: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  currentChallenge: string | null;
  createdAt: Date;
  maxPlayers: number;
  password: string | null;
  timeLimit: number;
  pointsToWin: number;
}

type RoomUpdatableFields = Omit<
  Room,
  "code" | "createdAt" | "players" | "password"
>;

const rooms = new Map<string, Room>();

export function createRoom(
  code: string,
  socketId: string,
  username: string,
  maxPlayers: number,
  password: string | null,
  timeLimit: number,
  pointsToWin: number,
): Room {
  const owner: Player = {
    isOwner: true,
    socketId,
    username,
    score: 0,
  };
  const room: Room = {
    code,
    players: [owner],
    status: "waiting",
    currentChallenge: null,
    createdAt: new Date(),
    maxPlayers,
    password,
    timeLimit,
    pointsToWin,
  };
  rooms.set(code, room);
  return room;
}
export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}
export function addPlayer(
  code: string,
  socketId: string,
  username: string,
  password: string | null,
): { success: true; room: Room } | { success: false; error: string } {
  const room = rooms.get(code);
  if (!room) {
    return { success: false, error: "roomNotFound" };
  }
  if (room.password !== null && room.password !== password) {
    return { success: false, error: "incorrectPassword" };
  }

  if (room.status !== "waiting") {
    return { success: false, error: "gameAlStarted" };
  }

  if (room.players.length >= room.maxPlayers) {
    return { success: false, error: "roomFull" };
  }
  const player: Player = {
    isOwner: false,
    socketId,
    username,
    score: 0,
  };
  room.players.push(player);

  return { success: true, room };
}

export function removePlayer(socketId: string): {
  room: Room | null;
  roomEmpty: boolean;
  wasPlaying: boolean;
} {
  for (const room of rooms.values()) {
    const index = room.players.findIndex(
      (player) => player.socketId === socketId,
    ); //testar criar um map com os socketId e o index com base na entrada de player em addPlayer nas proximas versões, para o mvp isso aqui funciona

    if (index === -1) continue;

    const wasPlaying = room.status === "playing";

    room.players.splice(index, 1);

    if (room.players.length === 0) {
      const deletedRoom = { ...room };
      rooms.delete(room.code);
      return { room: deletedRoom, roomEmpty: true, wasPlaying };
    }

    const ownerLeft = !room.players.some((player) => player.isOwner);
    if (ownerLeft) {
      room.players[0].isOwner = true;
    }
    return { room, roomEmpty: false, wasPlaying };
  }
  return { room: null, roomEmpty: false, wasPlaying: false };
}

export function updateRoom(
  code: string,
  changes: Partial<RoomUpdatableFields>,
): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  Object.assign(room, changes);

  return room;
}
export function roomLen() {
  return rooms.size;
}
export function deleteRoom(code: string): boolean {
  return rooms.delete(code);
}
