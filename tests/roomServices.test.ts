import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  generateRoomCode,
  serviceCreateRoom,
  joinRoom,
  leaveRoom,
  getRoomInfo,
} from "../src/services/roomServices";

const VALID = {
  maxPlayers: 4,
  timeLimit: 300,
  pointsToWin: 100,
  solvedCount: 0,
};

function createValidRoom(username = "owner01", maxPlayers = VALID.maxPlayers, password: string | null = null) {
  return serviceCreateRoom(
    `socket-${Math.random().toString(36).slice(2)}`,
    username,
    maxPlayers,
    password,
    VALID.timeLimit,
    VALID.pointsToWin,
    VALID.solvedCount,
  );
}

describe("generateRoomCode", () => {
  it("gera um codigo de 4 letras maiusculas", () => {
    for (let i = 0; i < 50; i++) {
      assert.match(generateRoomCode(), /^[A-Z]{4}$/);
    }
  });
});

describe("serviceCreateRoom", () => {
  it("cria a sala com o criador como dono e status waiting", () => {
    const result = createValidRoom();

    assert.equal(result.success, true);
    if (!result.success) return;

    assert.match(result.room.code, /^[A-Z]{4}$/);
    assert.equal(result.room.status, "waiting");
    assert.equal(result.room.players.length, 1);
    assert.equal(result.room.players[0].isOwner, true);
    assert.equal(result.room.players[0].score, 0);
  });

  it("recusa username fora do intervalo de 4 a 12 caracteres", () => {
    const curto = createValidRoom("abc");
    assert.equal(curto.success, false);
    if (!curto.success) assert.equal(curto.error, "invalidUsername");

    const longo = createValidRoom("usuarioMuitoLongoDemais");
    assert.equal(longo.success, false);
    if (!longo.success) assert.equal(longo.error, "invalidUsername");
  });

  it("recusa username com caracteres nao alfanumericos", () => {
    const result = createValidRoom("user name");
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.error, "invalidUsername");
  });

  it("recusa maxPlayers fora do intervalo de 2 a 20", () => {
    const poucos = createValidRoom("owner01", 1);
    assert.equal(poucos.success, false);
    if (!poucos.success) assert.equal(poucos.error, "invalidMaxPlayers");

    const muitos = createValidRoom("owner01", 21);
    assert.equal(muitos.success, false);
    if (!muitos.success) assert.equal(muitos.error, "invalidMaxPlayers");
  });

  it("recusa pointsToWin acima do maximo", () => {
    const result = serviceCreateRoom(
      "socket-pts",
      "owner01",
      VALID.maxPlayers,
      null,
      VALID.timeLimit,
      600,
      0,
    );
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.error, "invalidPointsToWin");
  });

  it("recusa timeLimit fora do intervalo de 60 a 1000 segundos", () => {
    const result = serviceCreateRoom(
      "socket-time",
      "owner01",
      VALID.maxPlayers,
      null,
      30,
      VALID.pointsToWin,
      0,
    );
    assert.equal(result.success, false);
  });
});

describe("joinRoom", () => {
  it("recusa entrada em sala inexistente", () => {
    const result = joinRoom("ZZZZ", "socket-x", "player01", null);
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.error, "roomNotFound");
  });

  it("recusa entrada com senha incorreta", () => {
    const created = createValidRoom("owner01", 4, "senha123");
    assert.equal(created.success, true);
    if (!created.success) return;

    const result = joinRoom(created.room.code, "socket-y", "player01", "errada");
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.error, "incorrectPassword");
  });

  it("aceita entrada com a senha correta e adiciona o jogador", () => {
    const created = createValidRoom("owner01", 4, "senha123");
    assert.equal(created.success, true);
    if (!created.success) return;

    const result = joinRoom(created.room.code, "socket-z", "player01", "senha123");
    assert.equal(result.success, true);
    if (!result.success) return;

    assert.equal(result.room.players.length, 2);
    assert.equal(result.room.players[1].isOwner, false);
  });

  it("recusa entrada em sala cheia", () => {
    const created = createValidRoom("owner01", 2);
    assert.equal(created.success, true);
    if (!created.success) return;

    const primeiro = joinRoom(created.room.code, "socket-a", "player01", null);
    assert.equal(primeiro.success, true);

    const segundo = joinRoom(created.room.code, "socket-b", "player02", null);
    assert.equal(segundo.success, false);
    if (!segundo.success) assert.equal(segundo.error, "roomFull");
  });

  it("recusa username invalido ao entrar", () => {
    const created = createValidRoom();
    assert.equal(created.success, true);
    if (!created.success) return;

    const result = joinRoom(created.room.code, "socket-c", "ab", null);
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.error, "invalidUsername");
  });
});

describe("leaveRoom", () => {
  it("transfere a posse da sala quando o dono sai", () => {
    const created = serviceCreateRoom(
      "socket-owner",
      "owner01",
      4,
      null,
      VALID.timeLimit,
      VALID.pointsToWin,
      0,
    );
    assert.equal(created.success, true);
    if (!created.success) return;

    joinRoom(created.room.code, "socket-guest", "player01", null);

    const result = leaveRoom("socket-owner");
    assert.equal(result.roomEmpty, false);
    assert.equal(result.room?.players.length, 1);
    assert.equal(result.room?.players[0].isOwner, true);
    assert.equal(result.room?.players[0].username, "player01");
  });

  it("remove a sala quando o ultimo jogador sai", () => {
    const created = serviceCreateRoom(
      "socket-solo",
      "owner01",
      4,
      null,
      VALID.timeLimit,
      VALID.pointsToWin,
      0,
    );
    assert.equal(created.success, true);
    if (!created.success) return;

    const code = created.room.code;
    const result = leaveRoom("socket-solo");

    assert.equal(result.roomEmpty, true);
    assert.equal(getRoomInfo(code), undefined);
  });

  it("nao quebra quando o socket nao esta em nenhuma sala", () => {
    const result = leaveRoom("socket-inexistente");
    assert.equal(result.room, null);
    assert.equal(result.roomEmpty, false);
  });
});
