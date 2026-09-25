# CodeSurv — Backend

API e servidor de tempo real do CodeSurv, um jogo multiplayer de desafios de programação.

## Stack

- **Runtime**: Node.js + TypeScript
- **HTTP**: Fastify
- **WebSocket**: Socket.IO
- **Banco de dados**: MongoDB (Mongoose)
- **Executor de código**: [Piston](https://github.com/engineer-man/piston) (self-hosted)

## Pré-requisitos

- Node.js 18+
- MongoDB em execução
- Instância do Piston em execução (ou use a pública em `https://emkc.org/api/v2/piston`)

## Configuração

```bash
cp .env.example .env
# edite o .env com suas variáveis
npm install
```

### Variáveis de ambiente (`.env`)

| Variável       | Padrão                                  | Descrição                         |
|----------------|-----------------------------------------|-----------------------------------|
| `PORT`         | `3000`                                  | Porta do servidor                 |
| `MONGO_URI`    | `mongodb://localhost:27017/codesurv`    | URI de conexão com o MongoDB      |
| `FRONTEND_URL` | `http://localhost:5173`                 | URL do frontend (CORS)            |
| `PISTON_URL`   | `http://localhost:2000`                 | URL da API do Piston              |

## Executando

```bash
# desenvolvimento (hot reload)
npm run dev

# popular o banco com desafios iniciais
npx tsx src/scripts/seedChallenge.ts
```

## Eventos Socket.IO

### Room (cliente → servidor)

| Evento        | Payload                                                        | Descrição              |
|---------------|----------------------------------------------------------------|------------------------|
| `room:create` | `{ username, maxPlayers, timeLimit, pointsToWin, password? }` | Cria uma sala          |
| `room:join`   | `{ code, username, password? }`                                | Entra em uma sala      |
| `room:leave`  | —                                                              | Sai da sala atual      |
| `room:list`   | —                                                              | Lista salas disponíveis|

### Room (servidor → cliente)

| Evento         | Payload           | Descrição                               |
|----------------|-------------------|-----------------------------------------|
| `room:created` | `Room`            | Sala criada com sucesso                 |
| `room:joined`  | `Room`            | Entrou na sala com sucesso              |
| `room:updated` | `Room`            | Estado da sala atualizado               |
| `room:userLeft`| `{ socketId }`    | Um jogador saiu                         |
| `room:list`    | `PublicRoom[]`    | Lista de salas em espera                |
| `room:error`   | `string`          | Código de erro                          |

### Game (cliente → servidor)

| Evento        | Payload                               | Descrição                    |
|---------------|---------------------------------------|------------------------------|
| `game:start`  | `{ code }`                            | Inicia o jogo (somente dono) |
| `game:submit` | `{ code, solution, language }`        | Envia solução                |

### Game (servidor → cliente)

| Evento             | Payload                                             | Descrição                        |
|--------------------|-----------------------------------------------------|----------------------------------|
| `game:started`     | `{ challenge, roundEndsAt }`                        | Jogo iniciado, novo desafio      |
| `game:correct`     | `{ username, score, players }`                      | Solução correta                  |
| `game:wrong`       | `{ error? }`                                        | Solução errada                   |
| `game:roundEnd`    | `{ challenge, roundEndsAt, players }`               | Round encerrado, próximo desafio |
| `game:end`         | `{ winner, players }`                               | Jogo encerrado, vencedor         |
| `game:interrupted` | `{ socketId }`                                      | Jogo interrompido (jogador saiu) |
| `game:error`       | `string`                                            | Código de erro                   |

## Estrutura

```
src/
├── db.ts                    # Conexão com MongoDB
├── server.ts                # Entrada da aplicação
├── models/
│   ├── Challenge.ts         # Schema do desafio
│   └── Match.ts             # Schema de partida (histórico)
├── services/
│   ├── judgeServices.ts     # Avaliação de soluções via Piston
│   └── roomServices.ts      # Lógica de criação e entrada em salas
├── socket/
│   ├── index.ts             # Registro dos handlers
│   ├── roomHandlers.ts      # Eventos de sala
│   └── gameHandlers.ts      # Eventos de jogo
├── store/
│   └── rooms.ts             # Estado em memória das salas
└── scripts/
    └── seedChallenge.ts     # Popula o banco com desafios
```

## Códigos de erro comuns

| Código               | Origem         | Significado                                |
|----------------------|----------------|--------------------------------------------|
| `roomNotFound`       | room/game      | Código de sala inválido                    |
| `invalidUsername`    | room           | Nickname inválido (4-12 chars, alfanum.)   |
| `invalidTimeLimit`   | room           | Tempo fora do intervalo [60, 1000]         |
| `invalidPointsToWin` | room           | Pontos fora do intervalo [80, 500]         |
| `roomFull`           | room           | Sala cheia                                 |
| `incorrectPassword`  | room           | Senha errada                               |
| `gameAlreadyStarted` | room           | Sala em jogo, não aceita novos jogadores   |
| `permissionDenied`   | game           | Apenas o dono pode iniciar o jogo          |
| `noChallenge`        | game           | Banco sem desafios (rode o seed)           |
| `judgeUnavailable`   | game           | Piston não está acessível                  |
| `solutionTooLarge`   | game           | Solução acima de 8000 caracteres           |
| `invalidPayload`     | game           | Payload de submit malformado               |
