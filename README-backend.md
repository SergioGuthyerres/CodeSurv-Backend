# codesurv-backend

> API e servidor de jogo do **CodeSurv** — plataforma de Casual Coding Game com desafios de lógica e algoritmos em tempo real, multiplayer, por salas.

---

## Sobre o projeto

O backend do CodeSurv é responsável por toda a lógica do jogo: orquestração de rounds, avaliação de código, gerenciamento de salas e (futuramente) persistência de partidas.

O estado das salas ativas é mantido **em memória** via `Map` JavaScript — sem Redis ou banco externo no fluxo em tempo real. O MongoDB é usado para armazenar os desafios e, na Fase 2, o histórico de partidas.

---

## Stack

| Tecnologia  | Uso                              |
|-------------|----------------------------------|
| Node.js 20+ | Runtime                          |
| Fastify     | Servidor HTTP                    |
| Socket.IO   | Comunicação em tempo real        |
| MongoDB     | Desafios e persistência (Fase 2) |
| Mongoose    | ODM / schemas                    |
| TypeScript  | Tipagem estática                 |
| tsx         | Execução e hot reload            |
| ESM         | Módulos nativos                  |

**Execução de código:** Piston API self-hosted em VM Azure (Ubuntu x64) — roda JavaScript 18.15.0 e Python 3.12 em sandbox.

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- MongoDB local ou Atlas
- Piston API rodando (local ou na VM Azure)

---

## Instalação

```bash
git clone https://github.com/SergioGuthyerres/codesurv-backend.git
cd codesurv-backend
npm install
cp .env.example .env
```

Edite o `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/codesurv
PISTON_URL=http://<ip-da-vm-azure>
```
nota:
---

### Configurando a Piston API

A Piston precisa estar rodando separadamente antes de iniciar o servidor. Para subir localmente via Docker:

```bash
docker run -d --name piston --restart always --privileged -p 2000:2000 -v piston-data:/piston ghcr.io/engineer-man/piston
```

Com o container rodando, instala as linguagens via API:

```bash
# JavaScript
curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language": "javascript", "version": "18.15.0"}'

# Python
curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language": "python", "version": "3.12.0"}'
```

Para confirmar que os runtimes estão ativos:

```bash
curl http://localhost:2000/api/v2/runtimes
```

Se a Piston estiver em outra máquina na rede, substitua `localhost` pelo IP da máquina no `PISTON_URL` do `.env`.


---

## Rodando localmente

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Estrutura de pastas

```
src/
├── routes/
├── socket/
│   ├── index.ts          # Registra roomHandlers e gameHandlers por socket
│   ├── roomHandlers.ts   # Eventos de sala
│   └── gameHandlers.ts   # Eventos de jogo
├── services/
│   ├── roomService.ts    # Lógica de criação e entrada em salas
│   ├── judgeService.ts   # Avaliação de soluções via Piston API
│   └── matchService.ts   # Persistência de partidas (Fase 2)
├── store/
│   └── rooms.ts          # Map em memória + operações CRUD de salas
├── models/
│   ├── Challenge.ts      # Schema de desafios (MongoDB)
│   └── Match.ts          # Schema de partidas (Fase 2)
├── scripts/
│   └── seedChallenges.ts # Script para popular o banco com desafios
├── db.ts                 # Conexão com MongoDB
└── server.ts             # Entry point: Fastify + Socket.IO + MongoDB
```

---

## Decisões de arquitetura

- **Sem Redis** — estado das salas em memória com `Map` no processo Node
- **Sem sistema de ready** — owner inicia o jogo quando quiser via `game:start`
- **Código da sala** — gerado pelo servidor (4 letras maiúsculas), nunca pelo usuário
- **Rounds ilimitados** — a partida dura até alguém atingir `pointsToWin`
- **Autenticação Fase 1** — apenas username digitado na tela, sem login
- **Autenticação Fase 2** — JWT próprio com bcrypt, após o jogo funcionar
- **Persistência** — adiada para Fase 2 junto com autenticação
- **Monetização** — cosméticos estilo Discord (avatares, temas, badges)

---

## Interfaces principais

```typescript
interface Player {
  socketId: string;
  username: string;
  score: number;
  isOwner: boolean;
  solvedCurrent: boolean;
}

interface Room {
  code: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  currentChallenge: string | null;
  createdAt: Date;
  maxPlayers: number;
  password: string | null;
  timeLimit: number;       // segundos (60–1000)
  pointsToWin: number;     // (80–500)
  solvedCount: number;
  roundEndsAt: Date | null;
}
```

---

## Regras de negócio

**Validações de sala:**
- `maxPlayers`: 2–20
- `timeLimit`: 60–1000 segundos
- `pointsToWin`: 80–500
- Máximo de 300 salas simultâneas

**Pontuação:**
```
Acerto: 10 pontos base
Bônus de velocidade por ordem de acerto:
  1º: +10, 2º: +8, 3º: +6, 4º: +4, 5º em diante: +2
Erro ou timeout: 0 pontos
```

**Ciclo de um round:**
1. Owner emite `game:start`
2. Servidor busca desafio aleatório no MongoDB, inicia `setTimeout` com `timeLimit`
3. Jogadores enviam `game:submit` com solução e linguagem
4. `judgeService` avalia via Piston API, calcula bônus por ordem de acerto
5. Quando todos acertam ou o tempo esgota: `handleRoundEnd` verifica se alguém atingiu `pointsToWin`
6. Se sim: emite `game:end` com vencedor. Se não: próximo round começa automaticamente

---

## Eventos Socket.IO

| Evento cliente → servidor | Evento servidor → cliente | Para quem         |
|---------------------------|---------------------------|-------------------|
| `room:create`             | `room:created`            | `socket.emit`     |
| `room:join`               | `room:joined`             | `socket.emit`     |
| —                         | `room:updated`            | `io.to(code)`     |
| `room:leave`              | `room:userLeft`           | `io.to(code)`     |
| —                         | `game:interrupted`        | `io.to(code)`     |
| `game:start`              | `game:started`            | `io.to(code)`     |
| `game:submit`             | `game:correct`            | `io.to(code)`     |
| —                         | `game:wrong`              | `socket.emit`     |
| —                         | `game:roundEnd`           | `io.to(code)`     |
| —                         | `game:end`                | `io.to(code)`     |
| qualquer falha            | `room:error` / `game:error` | `socket.emit`   |

**Payload de `game:submit`:**
```json
{ "code": "ABCD", "solution": "return a + b;", "language": "javascript" }
```

---

## Avaliação de código (judgeService)

O `evaluateSolution` monta o código completo concatenando `functionSig` + solução do jogador, envia para a Piston API e compara o output com o `expected` via `JSON.stringify`.

Estrutura montada para JavaScript:
```javascript
function solve(a, b){ <solução do jogador> }
console.log(JSON.stringify(solve(1, 2)))
```

Estrutura montada para Python:
```python
def solve(a, b):
    <solução do jogador>
import json
print(json.dumps(solve(1, 2)))
```

---

## Modelo de desafio (MongoDB)

```typescript
interface Challenge {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  testCases: {
    input: any[];
    expected: any;
    isPublic: boolean;   // false = caso oculto, não exibido ao jogador
  }[];
  languages: Array<"javascript" | "python">;
  functionSig: {
    javascript?: string; // ex: "function solve(a, b){"
    python?: string;     // ex: "def solve(a, b):\n "
  };
}
```

Para popular o banco com desafios:
```bash
npx tsx src/scripts/seedChallenges.ts
```

---

## Criando desafios

Todos os desafios ficam no MongoDB e são inseridos via `src/scripts/seedChallenges.ts`. Para criar um novo, adicione um `Challenge.create({...})` no script e rode:

```bash
npx tsx src/scripts/seedChallenges.ts
```

### Populando o banco com o script de seed

O arquivo `src/scripts/seedChallenges.ts` é o único ponto de entrada para inserir desafios no banco. Para rodar:

```bash
npx tsx src/scripts/seedChallenges.ts
```

Cada execução **adiciona** os desafios ao banco sem apagar os anteriores. Se quiser limpar tudo antes de inserir, adicione no início do script:

```typescript
await Challenge.deleteMany({});
```

**Para gerar novos desafios**, use o prompt disponível em `docs/prompt-desafios.md` numa conversa com o Claude. Ele gera o JSON já no formato correto do schema — basta colar o resultado como um novo `Challenge.create({...})` no script e rodar.

**Requisitos antes de rodar o seed:**
- MongoDB rodando e `MONGO_URI` configurado no `.env`
- O desafio gerado deve ter sido testado manualmente antes de inserir — cole o `functionSig` + uma solução válida na Piston API e confirme que o output bate com o `expected` via `JSON.stringify`

---

### Regras do `functionSig`

O `functionSig` define a assinatura da função que o jogador vai completar. O `judgeService` concatena o `functionSig` com a solução do jogador para montar o código completo antes de enviar à Piston API. Por isso, a assinatura precisa seguir um padrão específico por linguagem.

**JavaScript** — a assinatura abre a função mas não a fecha. O jogador escreve apenas o corpo, e o `judgeService` fecha o `}` automaticamente:

```
functionSig:  "function solve(a, b){"
solução:      "return a + b;"
código final: "function solve(a, b){ return a + b; }"
```

**Python** — a assinatura termina com `:\n ` (dois pontos + quebra de linha + espaço). O jogador escreve o corpo já indentado, pois Python usa indentação no lugar de chaves:

```
functionSig:  "def solve(a, b):\n "
solução:      "return a + b"
código final: "def solve(a, b):
                   return a + b"
```

### Regras dos `testCases`

- `input` é sempre um array, mesmo que o desafio tenha só um parâmetro: `[5]`, não `5`
- `expected` é o valor de retorno esperado — pode ser número, string, booleano ou array
- Recomendado: 3 casos públicos (`isPublic: true`) exibidos ao jogador e 3+ casos ocultos (`isPublic: false`) usados só na avaliação, para evitar soluções hardcoded
- A comparação é feita via `JSON.stringify`, então o tipo importa: `1` e `"1"` são diferentes

### Exemplo completo

```typescript
await Challenge.create({
  title: "Soma simples",
  description: "Dados dois inteiros a e b, retorne a soma entre eles.",
  difficulty: "easy",
  tags: ["math", "beginner"],
  languages: ["javascript", "python"],
  functionSig: {
    javascript: "function solve(a, b){",
    python: "def solve(a, b):\n "
  },
  testCases: [
    { input: [1, 2],    expected: 3,  isPublic: true  },
    { input: [-3, -2],  expected: -5, isPublic: true  },
    { input: [100, -2], expected: 98, isPublic: true  },
    { input: [1, 0],    expected: 1,  isPublic: false },
    { input: [0, 0],    expected: 0,  isPublic: false },
    { input: [0, 1],    expected: 1,  isPublic: false },
  ]
});
```
---

## Fases de desenvolvimento

**Fase 1 — MVP (atual):**
- Salas em memória, sem autenticação
- Jogadores identificados por username + socket.id
- Desafios em JavaScript e Python via Piston API
- Ciclo completo: criar sala → entrar → iniciar → submeter → vencer

**Fase 2 — pós-MVP:**
- Autenticação JWT + bcrypt
- `models/Match.ts` + `services/matchService.ts`
- Stats de usuário
- Sistema de cosméticos (avatares, temas, badges)

---

## Relacionado

- [codesurv-frontend](https://github.com/SergioGuthyerres/CodeSurv-Frontend.git) — interface React do jogador (4 telas: entrada, sala de espera, jogo, fim de jogo)
