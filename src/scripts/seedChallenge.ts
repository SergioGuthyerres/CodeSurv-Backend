import mongoose from "mongoose";
import { connectDB } from "../db";
import { Challenge } from "../models/Challenge";

async function seed() {
  await connectDB();

  const existing = await Challenge.countDocuments();
  if (existing > 0) {
    console.info(`Banco já possui ${existing} desafio(s). Pulando seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  await Challenge.create([
    {
      title: "Soma de Dois Números",
      description:
        "Dados dois inteiros `a` e `b`, retorne a soma deles.\n\nExemplo:\n- `solve(2, 3)` → `5`\n- `solve(-1, 10)` → `9`",
      difficulty: "easy",
      tags: ["math", "básico"],
      languages: ["javascript", "python"],
      functionSig: {
        javascript: "function solve(a, b) {",
        python: "def solve(a, b):",
      },
      testCases: [
        { input: [2, 3], expected: 5, isPublic: true },
        { input: [-1, 10], expected: 9, isPublic: true },
        { input: [0, 0], expected: 0, isPublic: false },
        { input: [100, -50], expected: 50, isPublic: false },
      ],
    },
    {
      title: "Inverter String",
      description:
        "Dada uma string `s`, retorne ela invertida.\n\nExemplo:\n- `solve('hello')` → `'olleh'`\n- `solve('abc')` → `'cba'`",
      difficulty: "easy",
      tags: ["string", "básico"],
      languages: ["javascript", "python"],
      functionSig: {
        javascript: "function solve(s) {",
        python: "def solve(s):",
      },
      testCases: [
        { input: ['"hello"'], expected: "olleh", isPublic: true },
        { input: ['"abc"'], expected: "cba", isPublic: true },
        { input: ['"a"'], expected: "a", isPublic: false },
        { input: ['""'], expected: "", isPublic: false },
      ],
    },
    {
      title: "Maior de Três",
      description:
        "Dados três números `a`, `b` e `c`, retorne o maior deles.\n\nExemplo:\n- `solve(1, 5, 3)` → `5`\n- `solve(10, 2, 7)` → `10`",
      difficulty: "easy",
      tags: ["math", "lógica"],
      languages: ["javascript", "python"],
      functionSig: {
        javascript: "function solve(a, b, c) {",
        python: "def solve(a, b, c):",
      },
      testCases: [
        { input: [1, 5, 3], expected: 5, isPublic: true },
        { input: [10, 2, 7], expected: 10, isPublic: true },
        { input: [-1, -5, -3], expected: -1, isPublic: false },
        { input: [4, 4, 4], expected: 4, isPublic: false },
      ],
    },
    {
      title: "Número Par ou Ímpar",
      description:
        "Dado um inteiro `n`, retorne `'even'` se for par ou `'odd'` se for ímpar.\n\nExemplo:\n- `solve(4)` → `'even'`\n- `solve(7)` → `'odd'`",
      difficulty: "easy",
      tags: ["math", "básico"],
      languages: ["javascript", "python"],
      functionSig: {
        javascript: "function solve(n) {",
        python: "def solve(n):",
      },
      testCases: [
        { input: [4], expected: "even", isPublic: true },
        { input: [7], expected: "odd", isPublic: true },
        { input: [0], expected: "even", isPublic: false },
        { input: [-3], expected: "odd", isPublic: false },
      ],
    },
    {
      title: "Contagem de Vogais",
      description:
        "Dada uma string `s`, retorne o número de vogais (`a, e, i, o, u`) presentes nela (case-insensitive).\n\nExemplo:\n- `solve('hello')` → `2`\n- `solve('sky')` → `0`",
      difficulty: "easy",
      tags: ["string", "lógica"],
      languages: ["javascript", "python"],
      functionSig: {
        javascript: "function solve(s) {",
        python: "def solve(s):",
      },
      testCases: [
        { input: ['"hello"'], expected: 2, isPublic: true },
        { input: ['"sky"'], expected: 0, isPublic: true },
        { input: ['"AEIOU"'], expected: 5, isPublic: false },
        { input: ['""'], expected: 0, isPublic: false },
      ],
    },
  ]);

  console.info("Seed concluído: 5 desafios inseridos.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
