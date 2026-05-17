
---

Você é um criador de desafios para o **CodeSurv**, um jogo de coding multiplayer. Preciso que gere desafios seguindo exatamente o schema abaixo.

**Schema:**
```typescript
{
  title: string;
  description: string; // explica o que a função deve fazer, parâmetros e retorno
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  languages: ["javascript", "python"];
  functionSig: {
    javascript: string; // abre a função mas NÃO fecha o }, ex: "function solve(a, b){"
    python: string;     // termina com :\n , ex: "def solve(a, b):\n "
  };
  testCases: [
    // 3 casos públicos (isPublic: true) — exibidos ao jogador
    // 3+ casos ocultos (isPublic: false) — usados só na avaliação
    { input: any[]; expected: any; isPublic: boolean }
  ];
}
```

**Regras obrigatórias:**
- O jogador escreve APENAS o corpo da função, sem assinar ela
- `input` é sempre um array, mesmo com um único parâmetro: `[5]` não `5`
- A comparação de resultado é via `JSON.stringify` — tipos importam: `1` e `"1"` são diferentes
- Casos ocultos devem cobrir edge cases: negativos, zeros, arrays vazios, strings vazias, etc.
- A função sempre se chama `solve` nas duas linguagens
- Desafios easy: operações simples com números, strings ou arrays. Sem estruturas de dados complexas.
- Desafios medium: manipulação de arrays/strings, lógica com loops. Sem recursão obrigatória.
- Desafios hard: algoritmos, recursão, ou múltiplas estruturas de dados.

**Formato de saída:** JSON válido pronto para usar no `Challenge.create()`, sem explicações adicionais.

Gere [NÚMERO] desafios de dificuldade [DIFICULDADE].


exemplo de desafio:
{title: "Soma simples", description: "o primeiro desafio do CodeSurv com entrada de dados! Dada dois números inteiros a e b, retorne a soma entre eles.", difficulty: "easy", tags: ["beginner"], testCases: [
        {input: [1, 2],
        expected: 3,
        isPublic: true},
        {input: [-3, -2],
        expected: -5,
        isPublic: true},
        {input: [100, -2],
        expected: 98,
        isPublic: true},
        {input: [1, 0],
        expected: 1,
        isPublic: false},
        {input: [0, 0],
        expected: 0,
        isPublic: false},
        {input: [0, 1],
        expected: 1,
        isPublic: false},
        ],
        languages: ["javascript", "python"],
        functionSig: {
        javascript: "function solve(a, b){",
        python: "def solve(a, b):\n "
    }
    }

---

Substitui `[NÚMERO]` e `[DIFICULDADE]` antes de colar. Os JSONs gerados você cola direto no `seedChallenges.ts` e roda.
