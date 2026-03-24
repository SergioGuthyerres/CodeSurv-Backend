import mongoose, { Schema } from "mongoose";

interface Challenge {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  testCases: {
    input: any[];
    expected: any;
    isPublic: boolean;
  }[];

  languages: Array<"javascript" | "python">;
  functionSig: {
    javascript?: string;
    python?: string;
  };
}
const challengeSchema = new Schema<Challenge>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  tags: { type: [String], required: true },
  testCases: [
    {
      input: { type: [], required: true },
      expected: { type: Schema.Types.Mixed, required: true },
      isPublic: { type: Boolean, required: true },
    },
  ],

  languages: { type: [String], enum: ["javascript", "python"], required: true },
  functionSig: { javascript: String, python: String },
});

export const Challenge = mongoose.model("Challenge", challengeSchema);
