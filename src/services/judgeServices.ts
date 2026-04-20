import { Challenge } from "../models/Challenge";

export async function getRandomChallenge() {
  const count = await Challenge.countDocuments();

  const randomIndex = Math.floor(Math.random() * count);

  const challenge = await Challenge.findOne().skip(randomIndex);

  if (challenge) {
    return challenge;
  }
  return null;
}
//por enquanto usaremos estrutura de if/else no evaluateSolution, mas se chegar a implementar mais linguagens, isso vai virar um objeto
export async function evaluateSolution(
  challenge: any,
  solution: string,
  language: "javascript" | "python",
): Promise<{ correct: boolean }> {
  const sig = challenge.functionSig[language];
  const testCases = challenge.testCases;
  if (language == "javascript") {
    for (const testCase of testCases) {
      let code = `
        ${sig}${solution} }

        console.log(JSON.stringify(solve(${testCase.input.join(", ")})))`;

      const response = await fetch(`${process.env.PISTON_URL}/api/v2/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "javascript",
          version: "18.15.0",
          files: [{ content: `${code}` }],
        }),
      });
      const data = await response.json();
      const output = data.run.stdout.trim();
      if (output !== JSON.stringify(testCase.expected)) {
        return { correct: false };
      }
    }
  } else if (language === "python") {
    for (const testCase of testCases) {
      let code = `${sig}
            ${solution}
import json
print(json.dumps(solve(${testCase.input.join(", ")})))`;
      const response = await fetch(`${process.env.PISTON_URL}/api/v2/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "python",
          version: "3.12",
          files: [{ content: `${code}` }],
        }),
      });
      const data = await response.json();
      const output = data.run.stdout.trim();
      if (output !== JSON.stringify(testCase.expected)) {
        return { correct: false };
      }
    }
  }
  return { correct: true };
}
