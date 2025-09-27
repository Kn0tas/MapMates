export type MultiplayerPhase = "idle" | "connecting" | "lobby" | "playing" | "voting" | "revealed" | "complete";

export type MultiplayerOption = {
  code: string;
  name: string;
};

export type MultiplayerPlayer = {
  id: string;
  nickname: string;
  score: number;
  status: string;
  isHost: boolean;
  lastChoice: string | null;
  connected: boolean;
  needsHostDecision?: boolean;
  disconnectDeadline?: number | null;
};

export type MultiplayerGameState = {
  code: string;
  name: string;
  state: "lobby" | "playing" | "voting" | "revealed" | "complete";
  round: number;
  attempt: number;
  targetCode: string | null;
  targetName: string | null;
  options: MultiplayerOption[];
  players: MultiplayerPlayer[];
  voteCounts: Record<string, number>;
  timerEndsAt: number | null;
  regionFilter: string;
  maxRounds: number;
  maxAttempts: number;
  mvpIds: string[];
};
