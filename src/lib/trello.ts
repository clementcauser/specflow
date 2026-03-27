import { getTrelloOAuthClient } from "@/lib/trello-oauth";

const TRELLO_API_BASE = "https://api.trello.com/1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrelloBoard {
  id: string;
  name: string;
}

export interface TrelloList {
  id: string;
  name: string;
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string | null;
}

export interface TrelloCardPayload {
  name: string;
  desc: string;
  priority: "MUST" | "SHOULD" | "COULD" | "WONT";
}

export interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
}

// MoSCoW → Trello label color mapping
const MOSCOW_COLORS: Record<"MUST" | "SHOULD" | "COULD" | "WONT", string> = {
  MUST: "red",
  SHOULD: "orange",
  COULD: "green",
  WONT: "sky",
};

const MOSCOW_LABEL_NAMES: Record<"MUST" | "SHOULD" | "COULD" | "WONT", string> = {
  MUST: "MUST HAVE",
  SHOULD: "SHOULD HAVE",
  COULD: "COULD HAVE",
  WONT: "WON'T HAVE",
};

// ─── OAuth-signed helpers ─────────────────────────────────────────────────────

async function trelloGet<T>(
  token: string,
  tokenSecret: string,
  path: string
): Promise<T> {
  const client = getTrelloOAuthClient();
  const url = `${TRELLO_API_BASE}${path}`;

  return new Promise((resolve, reject) => {
    client.get(url, token, tokenSecret, (err, data) => {
      if (err) {
        reject(
          new Error(
            `Trello GET ${path} failed: ${typeof err === "object" ? JSON.stringify(err) : err}`
          )
        );
        return;
      }
      try {
        resolve(JSON.parse(data as string) as T);
      } catch {
        reject(new Error(`Trello GET ${path}: invalid JSON response`));
      }
    });
  });
}

async function trelloPost<T>(
  token: string,
  tokenSecret: string,
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const client = getTrelloOAuthClient();
  const url = `${TRELLO_API_BASE}${path}`;
  const postBody = new URLSearchParams(
    Object.entries(body).map(([k, v]) => [k, String(v)])
  ).toString();

  return new Promise((resolve, reject) => {
    client.post(
      url,
      token,
      tokenSecret,
      postBody,
      "application/x-www-form-urlencoded",
      (err, data) => {
        if (err) {
          reject(
            new Error(
              `Trello POST ${path} failed: ${typeof err === "object" ? JSON.stringify(err) : err}`
            )
          );
          return;
        }
        try {
          resolve(JSON.parse(data as string) as T);
        } catch {
          reject(new Error(`Trello POST ${path}: invalid JSON response`));
        }
      }
    );
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getTrelloMemberMe(
  token: string,
  tokenSecret: string
): Promise<TrelloMember> {
  return trelloGet<TrelloMember>(token, tokenSecret, "/members/me");
}

export async function getBoards(
  token: string,
  tokenSecret: string
): Promise<TrelloBoard[]> {
  const boards = await trelloGet<TrelloBoard[]>(
    token,
    tokenSecret,
    "/members/me/boards?filter=open"
  );
  return boards.map((b) => ({ id: b.id, name: b.name }));
}

export async function getLists(
  token: string,
  tokenSecret: string,
  boardId: string
): Promise<TrelloList[]> {
  const lists = await trelloGet<TrelloList[]>(
    token,
    tokenSecret,
    `/boards/${boardId}/lists?filter=open`
  );
  return lists.map((l) => ({ id: l.id, name: l.name }));
}

export async function ensureLabels(
  token: string,
  tokenSecret: string,
  boardId: string
): Promise<Record<"MUST" | "SHOULD" | "COULD" | "WONT", string>> {
  const existing = await trelloGet<TrelloLabel[]>(
    token,
    tokenSecret,
    `/boards/${boardId}/labels`
  );

  const labelMap = {} as Record<"MUST" | "SHOULD" | "COULD" | "WONT", string>;
  const priorities = ["MUST", "SHOULD", "COULD", "WONT"] as const;

  for (const priority of priorities) {
    const color = MOSCOW_COLORS[priority];
    const name = MOSCOW_LABEL_NAMES[priority];

    // Find an existing label with the same color and name
    const found = existing.find(
      (l) => l.color === color && l.name === name
    );

    if (found) {
      labelMap[priority] = found.id;
    } else {
      const created = await trelloPost<TrelloLabel>(
        token,
        tokenSecret,
        "/labels",
        { name, color, idBoard: boardId }
      );
      labelMap[priority] = created.id;
    }
  }

  return labelMap;
}

export async function createCard(
  token: string,
  tokenSecret: string,
  listId: string,
  card: TrelloCardPayload,
  labelId: string
): Promise<{ id: string; url: string }> {
  return trelloPost<{ id: string; url: string }>(
    token,
    tokenSecret,
    "/cards",
    {
      idList: listId,
      name: card.name,
      desc: card.desc,
      idLabels: labelId,
    }
  );
}
