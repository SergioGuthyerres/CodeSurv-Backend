export interface Player {
  socketId: string;
  username: string;
  score: number;
  isOwner: boolean;
  solvedCurrent: boolean;
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
  solvedCount: number;
  roundEndsAt: Date | null;
  roundTimer: ReturnType<typeof setTimeout> | null;
}

export interface PublicRoom {
  code: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  timeLimit: number;
  pointsToWin: number;
  status: "waiting" | "playing" | "finished";
}

type RoomUpdatableFields = Omit<Room, "code" | "createdAt" | "password">;

const rooms = new Map<string, Room>();

export function createRoom(
  code: string,
  socketId: string,
  username: string,
  maxPlayers: number,
  password: string | null,
  timeLimit: number,
  pointsToWin: number,
  solvedCount: number,
): Room {
  const owner: Player = {
    isOwner: true,
    socketId,
    username,
    score: 0,
    solvedCurrent: false,
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
    roundEndsAt: null,
    pointsToWin,
    solvedCount,
    roundTimer: null,
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function getRoomsPublic(): PublicRoom[] {
  return Array.from(rooms.values())
    .filter((r) => r.status === "waiting")
    .map((r) => ({
      code: r.code,
      playerCount: r.players.length,
      maxPlayers: r.maxPlayers,
      isPrivate: r.password !== null,
      timeLimit: r.timeLimit,
      pointsToWin: r.pointsToWin,
      status: r.status,
    }));
}

export function addPlayer(
  code: string,
  socketId: string,
  username: string,
  password: string | null,
): { success: true; room: Room } | { success: false; error: string } {
  const room = rooms.get(code);
  if (!room) return { success: false, error: "roomNotFound" };
  if (room.password !== null && room.password !== password) {
    return { success: false, error: "incorrectPassword" };
  }
  if (room.status !== "waiting") {
    return { success: false, error: "gameAlreadyStarted" };
  }
  if (room.players.length >= room.maxPlayers) {
    return { success: false, error: "roomFull" };
  }
  const player: Player = {
    isOwner: false,
    socketId,
    username,
    score: 0,
    solvedCurrent: false,
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
    const index = room.players.findIndex((p) => p.socketId === socketId);
    if (index === -1) continue;

    const wasPlaying = room.status === "playing";
    room.players.splice(index, 1);

    if (room.players.length === 0) {
      if (room.roundTimer) clearTimeout(room.roundTimer);
      const deletedRoom = { ...room };
      rooms.delete(room.code);
      return { room: deletedRoom, roomEmpty: true, wasPlaying };
    }

    const ownerLeft = !room.players.some((p) => p.isOwner);
    if (ownerLeft) room.players[0].isOwner = true;

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
