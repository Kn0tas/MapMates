import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const countriesPath = path.join(__dirname, "..", "src", "data", "countries.json");
const countries = JSON.parse(fs.readFileSync(countriesPath, "utf8"));

const ROUND_LIMIT = 20;
const ATTEMPT_POINTS = [10, 9, 7, 5];
const MAX_ATTEMPTS = ATTEMPT_POINTS.length;
const VOTE_DURATION_MS = 15_000;
const DISCONNECT_GRACE_MS = 20_000;

const REGION_BY_FILTER = {
  all: null,
  europe: ["Europe"],
  americas: ["Americas"],
  asiaOceania: ["Asia", "Oceania"],
  africa: ["Africa"],
};

const games = new Map();

const filterCountries = (filter) => {
  const regions = REGION_BY_FILTER[filter] ?? null;
  if (!regions) {
    return countries;
  }
  return countries.filter((country) => regions.includes(country.region));
};

const buildRound = (pool, excludeCode) => {
  const workingPool = pool.length ? pool : countries;
  const filteredPool = excludeCode
    ? workingPool.filter((country) => country.code !== excludeCode)
    : workingPool;
  const targetPool = filteredPool.length ? filteredPool : workingPool;

  const target = targetPool[Math.floor(Math.random() * targetPool.length)];

  const sameRegionPool = workingPool.filter(
    (candidate) => candidate.code !== target.code && candidate.region === target.region
  );
  const fallbackPool = workingPool.filter((candidate) => candidate.code !== target.code);
  const sourcePool = sameRegionPool.length >= 3 ? sameRegionPool : fallbackPool;

  const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, Math.min(3, shuffled.length));

  const options = [...distractors.map((item) => item.code), target.code]
    .map((code) => ({
      code,
      name: countries.find((country) => country.code === code)?.name ?? code,
    }))
    .sort(() => Math.random() - 0.5);

  return { target, options };
};

const createPlayer = (nickname) => ({
  id: nanoid(),
  nickname,
  score: 0,
  correct: false,
  hasAnswered: false,
  lastChoice: null,
  status: "lobby",
  connected: true,
  disconnectDeadline: null,
  disconnectTimer: null,
  awaitingHostDecision: false,
});

const removePlayer = (game, playerId) => {
  const player = game.players.get(playerId);
  if (!player) {
    return;
  }

  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
  }

  game.players.delete(playerId);
  game.nicknames.delete(player.nickname.toLowerCase());

  if (game.hostId === playerId) {
    const remaining = Array.from(game.players.values());
    game.hostId = remaining[0]?.id ?? null;
  }

  if (!game.players.size) {
    games.delete(game.code);
  }
};

const getMvpIds = (game) => {
  const players = Array.from(game.players.values());
  const topScore = Math.max(0, ...players.map((player) => player.score));
  if (!topScore) {
    return [];
  }
  return players.filter((player) => player.score === topScore).map((player) => player.id);
};

const getGameStatePayload = (game) => {
  const players = Array.from(game.players.values()).map((player) => ({
    id: player.id,
    nickname: player.nickname,
    score: player.score,
    status: player.status,
    isHost: player.id === game.hostId,
    lastChoice: player.lastChoice,
    connected: player.connected,
    needsHostDecision: player.awaitingHostDecision,
    disconnectDeadline: player.disconnectDeadline,
  }));

  return {
    code: game.code,
    name: game.name,
    state: game.state,
    round: game.round,
    attempt: game.attempt,
    targetCode: game.target?.code ?? null,
    targetName: game.target?.name ?? null,
    options: game.options ?? [],
    players,
    voteCounts: game.voteCounts ?? {},
    timerEndsAt: game.timerEndsAt ?? null,
    regionFilter: game.regionFilter,
    maxRounds: ROUND_LIMIT,
    maxAttempts: MAX_ATTEMPTS,
    mvpIds: getMvpIds(game),
  };
};

const emitGameState = (game) => {
  io.to(game.code).emit("game:state", getGameStatePayload(game));
};

const buildPoolForGame = (game) => {
  return filterCountries(game.regionFilter);
};

const resetForNewRound = (game) => {
  game.players.forEach((player) => {
    player.correct = false;
    player.hasAnswered = false;
    player.lastChoice = null;
    if (player.connected) {
      player.status = game.state === "lobby" ? "lobby" : "playing";
    }
  });
};

const startRound = (game, excludeCode) => {
  game.state = "playing";
  game.attempt = 1;
  const pool = buildPoolForGame(game);
  const { target, options } = buildRound(pool, excludeCode);
  game.target = target;
  game.options = options;
  game.voteCounts = {};
  game.timerEndsAt = null;
  resetForNewRound(game);
  emitGameState(game);
};

const finishRound = (game) => {
  if (game.timer) {
    clearTimeout(game.timer);
    game.timer = null;
  }
  game.state = "revealed";
  game.voteCounts = {};
  game.timerEndsAt = null;
  emitGameState(game);

  setTimeout(() => {
    advanceRoundOrEnd(game);
  }, 2000);
};

const advanceRoundOrEnd = (game) => {
  if (game.round >= ROUND_LIMIT) {
    game.state = "complete";
    game.timerEndsAt = null;
    emitGameState(game);
    return;
  }

  game.round += 1;
  startRound(game, game.target?.code);
};

const evaluateGuesses = (game) => {
  const targetCode = game.target.code;
  const pending = [];

  game.players.forEach((player) => {
    if (!player.connected) {
      return;
    }
    if (player.correct) {
      return;
    }

    if (player.lastChoice === targetCode) {
      const points = ATTEMPT_POINTS[Math.min(game.attempt, MAX_ATTEMPTS) - 1] ?? 0;
      player.score += points;
      player.correct = true;
      player.status = "correct";
    } else {
      pending.push(player);
      player.status = "pending";
    }
  });

  if (!pending.length || game.attempt >= MAX_ATTEMPTS) {
    finishRound(game);
    return;
  }

  game.attempt += 1;
  game.state = "voting";
  game.voteCounts = pending.reduce((acc, player) => {
    const choice = player.lastChoice;
    if (choice) {
      acc[choice] = (acc[choice] ?? 0) + 1;
    }
    return acc;
  }, {});
  game.timerEndsAt = Date.now() + VOTE_DURATION_MS;
  emitGameState(game);

  if (game.timer) {
    clearTimeout(game.timer);
  }
  game.timer = setTimeout(() => {
    finishRound(game);
  }, VOTE_DURATION_MS);
};

const resolveHostDecision = (game, player) => {
  player.awaitingHostDecision = false;
  player.disconnectDeadline = Date.now() + DISCONNECT_GRACE_MS;
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
  }
  player.disconnectTimer = setTimeout(() => {
    removePlayer(game, player.id);
    emitGameState(game);
  }, DISCONNECT_GRACE_MS);
};

const cancelDisconnectTimer = (player) => {
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }
  player.disconnectDeadline = null;
  player.awaitingHostDecision = false;
};

io.on("connection", (socket) => {
  socket.on("create_game", ({ nickname, gameName = "", regionFilter = "all" }, callback) => {
    const trimmedNickname = `${nickname ?? ""}`.trim();
    if (!trimmedNickname) {
      callback?.({ success: false, error: "Nickname required" });
      return;
    }

    let code;
    do {
      code = nanoid(4).toUpperCase();
    } while (games.has(code));

    const player = createPlayer(trimmedNickname);
    const game = {
      code,
      name: `${gameName ?? ""}`.trim() || "Untitled Lobby",
      hostId: player.id,
      regionFilter,
      players: new Map([[player.id, player]]),
      nicknames: new Set([trimmedNickname.toLowerCase()]),
      state: "lobby",
      round: 0,
      attempt: 0,
      target: null,
      options: [],
      timer: null,
      timerEndsAt: null,
      voteCounts: {},
    };

    games.set(code, game);

    socket.join(code);
    socket.data = { gameCode: code, playerId: player.id };

    emitGameState(game);
    callback?.({ success: true, code, playerId: player.id });
  });

  socket.on("join_game", ({ code, nickname }, callback) => {
    const game = games.get((code ?? "").toUpperCase());
    if (!game) {
      callback?.({ success: false, error: "Game not found" });
      return;
    }

    const trimmedNickname = `${nickname ?? ""}`.trim();
    if (!trimmedNickname) {
      callback?.({ success: false, error: "Nickname required" });
      return;
    }

    const nicknameKey = trimmedNickname.toLowerCase();
    const existingPlayer = Array.from(game.players.values()).find(
      (player) => player.nickname.toLowerCase() === nicknameKey
    );

    if (existingPlayer) {
      if (!existingPlayer.connected) {
        cancelDisconnectTimer(existingPlayer);
        existingPlayer.connected = true;
        existingPlayer.status = game.state === "lobby" ? "lobby" : "playing";

        socket.join(game.code);
        socket.data = { gameCode: game.code, playerId: existingPlayer.id };

        emitGameState(game);
        callback?.({ success: true, playerId: existingPlayer.id, reconnected: true });
        return;
      }

      callback?.({ success: false, error: "Nickname already taken" });
      return;
    }

    if (game.state !== "lobby") {
      callback?.({ success: false, error: "Game already started" });
      return;
    }

    const player = createPlayer(trimmedNickname);
    game.players.set(player.id, player);
    game.nicknames.add(nicknameKey);

    socket.join(game.code);
    socket.data = { gameCode: game.code, playerId: player.id };

    emitGameState(game);
    callback?.({ success: true, playerId: player.id });
  });

  socket.on("leave_game", (_, callback) => {
    const { gameCode, playerId } = socket.data || {};
    if (!gameCode || !playerId) {
      callback?.({ success: false, error: "Not in a game" });
      return;
    }
    const game = games.get(gameCode);
    if (!game) {
      callback?.({ success: true });
      return;
    }

    removePlayer(game, playerId);
    socket.leave(gameCode);
    socket.data = {};

    if (games.has(gameCode)) {
      emitGameState(game);
    }
    callback?.({ success: true });
  });

  socket.on("start_game", (_, callback) => {
    const { gameCode, playerId } = socket.data || {};
    const game = games.get(gameCode);
    if (!game) {
      callback?.({ success: false, error: "Game not found" });
      return;
    }
    if (game.hostId !== playerId) {
      callback?.({ success: false, error: "Only host can start" });
      return;
    }
    if (game.players.size < 1) {
      callback?.({ success: false, error: "Need at least one player" });
      return;
    }

    game.players.forEach((player) => {
      player.score = 0;
      player.correct = false;
      player.hasAnswered = false;
      player.lastChoice = null;
      if (player.connected) {
        player.status = "playing";
      }
    });

    game.round = 1;
    startRound(game);
    callback?.({ success: true });
  });

  socket.on("submit_guess", ({ choice }, callback) => {
    const { gameCode, playerId } = socket.data || {};
    const game = games.get(gameCode);
    if (!game) {
      callback?.({ success: false, error: "Game not found" });
      return;
    }

    if (game.state !== "playing" && game.state !== "voting") {
      callback?.({ success: false, error: "Not accepting guesses" });
      return;
    }

    const player = game.players.get(playerId);
    if (!player) {
      callback?.({ success: false, error: "Player not part of game" });
      return;
    }
    if (!player.connected) {
      callback?.({ success: false, error: "Player disconnected" });
      return;
    }
    if (player.correct) {
      callback?.({ success: false, error: "Already correct" });
      return;
    }

    player.lastChoice = choice;
    player.hasAnswered = true;
    player.status = "answered";

    if (game.state === "voting") {
      game.voteCounts[choice] = (game.voteCounts[choice] ?? 0) + 1;
      emitGameState(game);
    }

    const activePlayers = Array.from(game.players.values()).filter((candidate) => candidate.connected);
    const allResponded = activePlayers.every((candidate) => candidate.correct || candidate.hasAnswered);

    if (allResponded && game.state !== "revealed") {
      evaluateGuesses(game);
    }

    callback?.({ success: true });
  });

  socket.on("set_region_filter", ({ filter }, callback) => {
    const { gameCode, playerId } = socket.data || {};
    const game = games.get(gameCode);
    if (!game) {
      callback?.({ success: false, error: "Game not found" });
      return;
    }
    if (game.hostId !== playerId) {
      callback?.({ success: false, error: "Only host can change region" });
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(REGION_BY_FILTER, filter)) {
      callback?.({ success: false, error: "Unknown region" });
      return;
    }

    game.regionFilter = filter;
    emitGameState(game);
    callback?.({ success: true });
  });

  socket.on("kick_player", ({ playerId }, callback) => {
    const { gameCode, playerId: requesterId } = socket.data || {};
    const game = games.get(gameCode);
    if (!game) {
      callback?.({ success: false, error: "Game not found" });
      return;
    }
    if (game.hostId !== requesterId) {
      callback?.({ success: false, error: "Only host can kick" });
      return;
    }
    if (!game.players.has(playerId)) {
      callback?.({ success: false, error: "Player not in lobby" });
      return;
    }

    const targetSocket = Array.from(io.sockets.sockets.values()).find(
      (client) => client.data?.playerId === playerId && client.data?.gameCode === gameCode
    );
    if (targetSocket) {
      targetSocket.emit("game:kicked");
      targetSocket.leave(gameCode);
      targetSocket.data = {};
    }

    removePlayer(game, playerId);
    emitGameState(game);
    callback?.({ success: true });
  });

  socket.on("resolve_disconnect", ({ playerId, action }, callback) => {
    const { gameCode, playerId: requesterId } = socket.data || {};
    const game = games.get(gameCode);
    if (!game) {
      callback?.({ success: false, error: "Game not found" });
      return;
    }
    if (game.hostId !== requesterId) {
      callback?.({ success: false, error: "Only host can decide" });
      return;
    }
    const target = game.players.get(playerId);
    if (!target) {
      callback?.({ success: false, error: "Player not found" });
      return;
    }
    if (action === "kick") {
      const targetSocket = Array.from(io.sockets.sockets.values()).find(
        (client) => client.data?.playerId === playerId && client.data?.gameCode === gameCode
      );
      if (targetSocket) {
        targetSocket.emit("game:kicked");
        targetSocket.leave(gameCode);
        targetSocket.data = {};
      }
      removePlayer(game, playerId);
      emitGameState(game);
      callback?.({ success: true });
      return;
    }
    if (action === "wait") {
      resolveHostDecision(game, target);
      emitGameState(game);
      callback?.({ success: true });
      return;
    }
    callback?.({ success: false, error: "Unknown action" });
  });

  socket.on("disconnect", () => {
    const { gameCode, playerId } = socket.data || {};
    if (!gameCode || !playerId) {
      return;
    }
    const game = games.get(gameCode);
    if (!game) {
      return;
    }

    const player = game.players.get(playerId);
    if (!player) {
      return;
    }

    player.connected = false;
    player.status = "disconnected";
    player.awaitingHostDecision = true;
    player.disconnectDeadline = null;

    if (game.hostId === playerId) {
      const replacement = Array.from(game.players.values()).find(
        (candidate) => candidate.id !== playerId && candidate.connected
      );
      if (replacement) {
        game.hostId = replacement.id;
      }
    }

    socket.leave(gameCode);
    socket.data = {};

    emitGameState(game);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`MapMates multiplayer server running on port ${PORT}`);
});
