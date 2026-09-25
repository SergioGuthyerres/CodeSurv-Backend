import mongoose, { Schema } from "mongoose";

interface IMatch {
  roomCode: string;
  players: { username: string; score: number }[];
  winner: string;
  challengeId: string;
  playedAt: Date;
}

const matchSchema = new Schema<IMatch>({
  roomCode: { type: String, required: true },
  players: [{ username: String, score: Number }],
  winner: { type: String, required: true },
  challengeId: { type: String, required: true },
  playedAt: { type: Date, default: Date.now },
});

export const Match = mongoose.model("Match", matchSchema);
