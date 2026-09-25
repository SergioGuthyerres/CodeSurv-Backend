import { Challenge } from "../models/Challenge";
import type { Document } from "mongoose";

const MAX_SOLUTION_LENGTH = 8000;

export async function getRandomChallenge() {
  const count = await Challenge.countDocuments();
  if (count === 0) return null;
  const randomIndex = Math.floor(Math.random() * count);
  return Challenge.findOne().skip(randomIndex);
}

export async function evaluateSolution(
  challenge: Document & InstanceType<typeof Challenge>,
  solution: string,
  language: "javascript" | "python",
): Promise<{ correct: boolean; error?: string }> {
  if (typeof solution !== "string" || solution.length > MAX_SOLUTION_LENGTH) {
    return { correct: false, error: "invalidSolution" };
  }

  const pistonUrl = process.env.PISTON_URL;
  if (!pistonUrl) {
    return { correct: false, error: "judgeUnavailable" };
  }

  const sig = challenge.functionSig[language as "javascript" | "python"];
  if (!sig) {
    return { correct: false, error: "languageNotSupported" };
  }

  const testCases = challenge.testCases;

  try {
    if (language === "javascript") {
      for (const testCase of testCases) {
        const code = `${sig}${solution} }\nconsole.log(JSON.stringify(solve(${testCase.input.join(", ")})))`;
        const result = await runOnPiston(pistonUrl, "javascript", "18.15.0", code);
        if (!result.ok) return { correct: false, error: result.error };
        if (result.output !== JSON.stringify(testCase.expected)) {
          return { correct: false };
        }
      }
    } else if (language === "python") {
      for (const testCase of testCases) {
        const code = `${sig}\n    ${solution}\nimport json\nprint(json.dumps(solve(${testCase.input.join(", ")})))`;
        const result = await runOnPiston(pistonUrl, "python", "3.12", code);
        if (!result.ok) return { correct: false, error: result.error };
        if (result.output !== JSON.stringify(testCase.expected)) {
          return { correct: false };
        }
      }
    }
  } catch (err) {
    console.error("Erro ao avaliar solução:", err);
    return { correct: false, error: "judgeUnavailable" };
  }

  return { correct: true };
}

async function runOnPiston(
  baseUrl: string,
  language: string,
  version: string,
  code: string,
): Promise<{ ok: true; output: string } | { ok: false; error: string }> {
  const response = await fetch(`${baseUrl}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, version, files: [{ content: code }] }),
  });

  if (!response.ok) {
    return { ok: false, error: "pistonRequestFailed" };
  }

  const data = await response.json();

  if (!data?.run?.stdout) {
    return { ok: false, error: "pistonInvalidResponse" };
  }

  return { ok: true, output: data.run.stdout.trim() };
}
