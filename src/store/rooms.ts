export interface Player {
  socketId: string;
  username: string;
  score: number;
  ready: boolean;
  isOwner: boolean;
}

export interface Room {
  code: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  currentChallenge: string | null;
  createdAt: Date;
  maxPlayers: number;
  senha: string | null;
}

type RoomUpdatableFields = Omit<
  Room,
  "code" | "createdAt" | "players" | "senha"
>;

const rooms = new Map<string, Room>();

export function createRoom(
  code: string,
  socketId: string,
  username: string,
  maxPlayers: number,
  senha: string | null,
): Room {
  const owner: Player = {
    isOwner: true,
    socketId,
    username,
    score: 0,
    ready: false,
  };
  const room: Room = {
    code,
    players: [owner],
    status: "waiting",
    currentChallenge: null,
    createdAt: new Date(),
    maxPlayers,
    senha,
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
  senha: string | null,
): { success: boolean; error?: string; room?: Room } {
  const room = rooms.get(code);
  if (!room) {
    return { success: false, error: "roomNotFound" };
  }
  if (room.senha !== null && room.senha !== senha) {
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
    ready: false,
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
    );

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

export function deleteRoom(code: string): boolean {
  return rooms.delete(code);
}
