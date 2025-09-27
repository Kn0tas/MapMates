import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { RegionFilter } from "./gameStore";
import {
  MultiplayerGameState,
  MultiplayerPhase,
  MultiplayerPlayer,
} from "../types/multiplayer";

type AckResponse = {
  success: boolean;
  error?: string;
  code?: string;
  playerId?: string;
  reconnected?: boolean;
};

type CreateGamePayload = {
  nickname: string;
  gameName?: string;
  regionFilter?: RegionFilter | "all";
};

type JoinGamePayload = {
  code: string;
  nickname: string;
};

type ResolveAction = "kick" | "wait";

type MultiplayerStoreState = {
  socket?: Socket;
  connecting: boolean;
  status: MultiplayerPhase;
  error?: string;
  game?: MultiplayerGameState;
  meId?: string;
  isReconnecting: boolean;
  lastAck?: AckResponse;
  ensureConnection: () => Promise<Socket>;
  createGame: (payload: CreateGamePayload) => Promise<AckResponse>;
  joinGame: (payload: JoinGamePayload) => Promise<AckResponse>;
  leaveGame: () => Promise<void>;
  startGame: () => Promise<AckResponse>;
  submitGuess: (choice: string) => Promise<AckResponse>;
  setRegionFilter: (filter: RegionFilter | "all") => Promise<AckResponse>;
  resolveDisconnect: (playerId: string, action: ResolveAction) => Promise<AckResponse>;
  clearError: () => void;
};

const SERVER_URL =
  (Constants.expoConfig?.extra as { multiplayerUrl?: string } | undefined)?.multiplayerUrl ??
  process.env.EXPO_PUBLIC_MULTIPLAYER_URL ??
  "http://localhost:4000";

const mapPhase = (state?: MultiplayerGameState["state"]): MultiplayerPhase => {
  switch (state) {
    case "lobby":
      return "lobby";
    case "playing":
      return "playing";
    case "voting":
      return "voting";
    case "revealed":
      return "revealed";
    case "complete":
      return "complete";
    default:
      return "idle";
  }
};

const emitWithAck = (
  socket: Socket,
  event: string,
  payload?: Record<string, unknown>
): Promise<AckResponse> => {
  return new Promise((resolve) => {
    socket.emit(event, payload ?? {}, (response: AckResponse) => {
      resolve(response ?? { success: true });
    });
  });
};

export const useMultiplayerStore = create<MultiplayerStoreState>((set, get) => ({
  socket: undefined,
  connecting: false,
  status: "idle",
  error: undefined,
  game: undefined,
  meId: undefined,
  isReconnecting: false,
  lastAck: undefined,
  ensureConnection: async () => {
    let socket = get().socket;
    if (socket?.connected) {
      return socket;
    }

    if (!socket) {
      socket = io(SERVER_URL, {
        transports: ["websocket"],
        autoConnect: false,
      });

      socket.on("connect", () => {
        set((state) => ({
          connecting: false,
          status: state.game ? mapPhase(state.game.state) : "lobby",
          error: undefined,
        }));
      });

      socket.on("disconnect", () => {
        set({ status: "idle" });
      });

      socket.on("connect_error", (err) => {
        set({ connecting: false, error: err?.message ?? "Unable to connect" });
      });

      socket.on("game:state", (payload: MultiplayerGameState) => {
        set((state) => ({
          game: payload,
          status: mapPhase(payload.state),
          isReconnecting: false,
        }));
      });

      socket.on("game:kicked", () => {
        set({
          game: undefined,
          status: "idle",
          error: "You have been removed from the lobby.",
        });
      });

      set({ socket });
    }

    if (!socket.connected) {
      set({ connecting: true });
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          socket?.off("connect", onConnect);
          socket?.off("connect_error", onError);
        };
        const onConnect = () => {
          cleanup();
          resolve();
        };
        const onError = (err: Error) => {
          cleanup();
          set({ connecting: false, error: err?.message ?? "Unable to connect" });
          reject(err);
        };
        socket.once("connect", onConnect);
        socket.once("connect_error", onError);
        socket.connect();
      });
    }

    return socket;
  },
  createGame: async ({ nickname, gameName, regionFilter = "all" }) => {
    let socket: Socket;
    try {
      socket = await get().ensureConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect";
      const failed: AckResponse = { success: false, error: message };
      set({ error: message, connecting: false, lastAck: failed });
      return failed;
    }

    const response = await emitWithAck(socket, "create_game", {
      nickname,
      gameName,
      regionFilter,
    });

    if (response.success && response.playerId) {
      set({ meId: response.playerId, status: "lobby", error: undefined });
    } else if (!response.success) {
      set({ error: response.error ?? "Unable to create game" });
    }

    set({ lastAck: response });
    return response;
  },
  joinGame: async ({ code, nickname }) => {
    let socket: Socket;
    try {
      socket = await get().ensureConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect";
      const failed: AckResponse = { success: false, error: message };
      set({ error: message, connecting: false, lastAck: failed });
      return failed;
    }

    const response = await emitWithAck(socket, "join_game", { code, nickname });

    if (response.success && response.playerId) {
      set({ meId: response.playerId, status: "lobby", error: undefined });
      if (response.reconnected) {
        set({ isReconnecting: false });
      }
    } else if (!response.success) {
      set({ error: response.error ?? "Unable to join game" });
    }

    set({ lastAck: response });
    return response;
  },
  leaveGame: async () => {
    const socket = get().socket;
    if (!socket?.connected) {
      set({ game: undefined, meId: undefined, status: "idle" });
      return;
    }
    await emitWithAck(socket, "leave_game");
    set({ game: undefined, meId: undefined, status: "idle" });
  },
  startGame: async () => {
    let socket: Socket;
    try {
      socket = await get().ensureConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect";
      const failed: AckResponse = { success: false, error: message };
      set({ error: message, connecting: false, lastAck: failed });
      return failed;
    }
    const response = await emitWithAck(socket, "start_game");
    if (!response.success) {
      set({ error: response.error ?? "Could not start game" });
    }
    set({ lastAck: response });
    return response;
  },
  submitGuess: async (choice) => {
    let socket: Socket;
    try {
      socket = await get().ensureConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect";
      const failed: AckResponse = { success: false, error: message };
      set({ error: message, connecting: false, lastAck: failed });
      return failed;
    }
    const response = await emitWithAck(socket, "submit_guess", { choice });
    if (!response.success) {
      set({ error: response.error ?? "Guess was not accepted" });
    }
    return response;
  },
  setRegionFilter: async (filter) => {
    let socket: Socket;
    try {
      socket = await get().ensureConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect";
      const failed: AckResponse = { success: false, error: message };
      set({ error: message, connecting: false, lastAck: failed });
      return failed;
    }
    const response = await emitWithAck(socket, "set_region_filter", { filter });
    if (!response.success) {
      set({ error: response.error ?? "Could not update region" });
    }
    return response;
  },
  resolveDisconnect: async (playerId, action) => {
    let socket: Socket;
    try {
      socket = await get().ensureConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect";
      const failed: AckResponse = { success: false, error: message };
      set({ error: message, connecting: false, lastAck: failed });
      return failed;
    }
    const response = await emitWithAck(socket, "resolve_disconnect", { playerId, action });
    if (!response.success) {
      set({ error: response.error ?? "Unable to update player" });
    }
    return response;
  },
  clearError: () => set({ error: undefined }),
}));

