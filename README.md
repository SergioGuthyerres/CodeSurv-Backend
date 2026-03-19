# codesurv-backend

> API REST e servidor de jogo do **CodeSurv** — plataforma de Casual Coding Game com desafios de lógica e algoritmos em tempo real.

---

## Sobre o projeto

O backend do CodeSurv é responsável por toda a lógica do jogo: orquestração de turnos, avaliação de scripts, gerenciamento de salas e persistência de partidas.

O estado das salas ativas é mantido **em memória** (Map JavaScript) — sem dependência de banco externo para o fluxo em tempo real. O MongoDB é usado apenas para persistir o histórico de partidas ao final de cada jogo.

---

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20+ | Runtime |
| Fastify | 4+ | Servidor HTTP / API REST |
| Socket.IO | 4+ | Comunicação em tempo real |
| MongoDB | Atlas | Persistência de partidas |
| Mongoose | 8+ | ODM / schemas |

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuita)

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/codesurv-backend.git
cd codesurv-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=3001
MONGO_URI=mongodb+srv://usuario:senha@cluster0.abc.mongodb.net/codesurv
```

---

## Rodando localmente

```bash
npm run dev
```

O servidor sobe em `http://localhost:3001`.

---

## Estrutura de pastas

```
src/
├── routes/
│   └── rooms.js          # Endpoints REST: listar salas públicas
│
├── socket/
│   ├── index.js          # Inicializa Socket.IO e registra os handlers
│   ├── roomHandlers.js   # Eventos de sala: criar, entrar, sair
│   └── gameHandlers.js   # Eventos de jogo: iniciar, submeter, avaliar, encerrar
│
├── services/
│   ├── roomService.js    # Operações no Map de salas (criar, buscar, atualizar)
│   ├── judgeService.js   # Avaliação de mini-scripts em sandbox com timeout
│   └── matchService.js   # Persistência de partidas no MongoDB
│
├── store/
│   └── rooms.js          # Map global de salas ativas + garbage collector
│
├── models/
│   └── Match.js          # Schema Mongoose para histórico de partidas
│
├── db.js                 # Conexão com MongoDB via Mongoose
└── server.js             # Entry point: inicializa Fastify, Socket.IO e DB
```

---

## Fluxo principal

```
server.js
  ├── conecta MongoDB (db.js)
  ├── registra rotas REST (routes/)
  └── inicializa Socket.IO (socket/index.js)
        ├── roomHandlers.js
        │     ├── room:create → cria sala no Map → retorna código ao host
        │     ├── room:join   → adiciona jogador → emite room:update pra todos
        │     └── disconnect  → remove jogador → limpa sala se vazia
        │
        └── gameHandlers.js
              ├── game:start  → seleciona desafio → inicia timer → emite game:start
              ├── game:submit → armazena submissão no estado da sala
              ├── [timer]     → ao expirar: avalia todos os scripts
              │                  judgeService.evaluate() → calcula pontuação
              │                  emite game:result pra todos
              └── [fim]       → última rodada: monta pódio
                                 emite game:end → matchService.saveMatch()
```

---

## Endpoints REST

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/rooms` | Não | Lista salas públicas disponíveis |
| `GET` | `/api/rooms/:code` | Não | Retorna detalhes de uma sala pelo código |
| `GET` | `/api/challenges/:id` | Não | Retorna um desafio pelo ID (Fase 1) |
| `POST` | `/api/auth/register` | Não | Cadastro de usuário (Fase 2) |
| `POST` | `/api/auth/login` | Não | Login e geração de token JWT (Fase 2) |

---

## Eventos Socket.IO

| Evento | Direção | Payload | Descrição |
|---|---|---|---|
| `room:create` | Recebe | `{ username, config }` | Cria nova sala, retorna código gerado |
| `room:join` | Recebe | `{ roomCode, username }` | Adiciona jogador à sala |
| `room:update` | Emite | `{ players, status }` | Atualiza estado do lobby para todos |
| `game:start` | Emite | `{ challenge, duration }` | Inicia turno com desafio e timer |
| `game:submit` | Recebe | `{ code, roomCode }` | Recebe solução do jogador |
| `game:result` | Emite | `{ scores, correct[] }` | Resultado do turno para todos |
| `game:end` | Emite | `{ podium }` | Encerra partida com pódio final |
| `room:disconnect` | Emite | `{ username }` | Notifica saída de jogador |

---

## Estado das salas

As salas vivem em memória no processo Node.js. Estrutura de cada sala:

```js
{
  code: "XK92P",
  hostId: "socket-id-do-host",
  status: "waiting | in_game | finished",
  config: {
    maxRounds: 5,
    turnDuration: 60,      // segundos
    difficulty: "easy | medium | hard",
    private: false
  },
  players: [
    { id: "socket-id", username: "sergio", score: 0 }
  ],
  currentRound: 1,
  currentChallenge: { id: "...", title: "...", description: "..." },
  lastActivity: 1719500000000   // timestamp — usado pelo garbage collector
}
```

> **Atenção:** ao reiniciar o servidor, todas as salas ativas são perdidas. Isso é esperado no MVP.

---

## Regras de negócio

**Ciclo de um turno:**
1. Host emite `game:start`
2. Server seleciona desafio, inicia `setTimeout` com a duração configurada
3. Jogadores enviam `game:submit` com suas soluções
4. Ao fim do timer (ou quando todos submeterem), `judgeService` avalia os scripts
5. Server emite `game:result` com acertos e pontuações
6. Se ainda há rodadas: aguarda próximo `game:start`
7. Na última rodada: emite `game:end`, persiste no MongoDB

**Pontuação por rodada:**
- Acerto: 10 pontos base
- Bônus de velocidade: até 10 pontos extras proporcionais a quantidade de pessoas que já acertaram (mínimo de 2 pontos extras)
- Erro ou timeout: 0 pontos

**Cotas:**
- Máximo de 1 sala ativa por socket/usuário
- Garbage collector remove salas com `lastActivity` maior que 10 minutos

**Segurança na avaliação de scripts:**
- Scripts nunca rodam no processo principal
- Execução em sandbox (vm2 ou Worker Thread)
- Timeout máximo de 2 segundos por submissão

---

## Scripts disponíveis

```bash
npm run dev      # Inicia com npx watch (hot reload)
```

---

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor | `3001` |
| `MONGO_URI` | URI de conexão do MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Chave secreta para tokens JWT (Fase 2) | `uma-string-longa-e-secreta` |

---

## Modelo de dados (MongoDB)

**Match** — salvo ao fim de cada partida:

```js
{
  players: [{ username: String, score: Number }],
  winner:  String,
  rounds:  Number,
  playedAt: Date
}
```

---

## Fases de desenvolvimento

- **Fase 1 — MVP:** Sem autenticação. Jogadores identificados pelo `socket.id` e username.
- **Fase 2:** Cadastro e login com e-mail, senha (bcrypt) e token JWT. Model `User` no MongoDB.
- **Fase 3:** OAuth (Google/GitHub) e histórico de partidas por usuário.

---

## Relacionado

- [codesurv-frontend](https://github.com/SergioGuthyerres/CodeSurv-Frontend.git) — interface React do jogador
