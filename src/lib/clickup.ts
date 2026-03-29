// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClickUpSpace {
  id: string;
  name: string;
}

export interface ClickUpList {
  id: string;
  name: string;
}

export interface ClickUpTaskPayload {
  name: string;
  description: string;
  priority: 1 | 2 | 3 | 4;
  tags: string[];
}

// ─── Priority mapping ─────────────────────────────────────────────────────────

export const MOSCOW_TO_CLICKUP_PRIORITY: Record<
  "MUST" | "SHOULD" | "COULD" | "WONT",
  1 | 2 | 3 | 4
> = {
  MUST: 1,   // urgent
  SHOULD: 2, // high
  COULD: 3,  // normal
  WONT: 4,   // low
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function clickupFetch(
  token: string,
  path: string,
  options?: RequestInit
): Promise<Response> {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  // Handle rate limit with a single retry after 60s
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 60_000));
    return clickupFetch(token, path, options);
  }

  return res;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getSpaces(
  token: string,
  workspaceId: string
): Promise<ClickUpSpace[]> {
  const res = await clickupFetch(
    token,
    `/team/${workspaceId}/space?archived=false`
  );

  if (!res.ok) {
    throw new Error(`ClickUp getSpaces failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return (data.spaces ?? []).map((s: { id: string; name: string }) => ({
    id: s.id,
    name: s.name,
  }));
}

export async function getLists(
  token: string,
  spaceId: string
): Promise<ClickUpList[]> {
  const [folderlessRes, foldersRes] = await Promise.all([
    clickupFetch(token, `/space/${spaceId}/list?archived=false`),
    clickupFetch(token, `/space/${spaceId}/folder?archived=false`),
  ]);

  if (!folderlessRes.ok) {
    throw new Error(`ClickUp getLists failed: ${folderlessRes.status} ${folderlessRes.statusText}`);
  }

  const folderlessData = await folderlessRes.json();
  const folderlessLists: ClickUpList[] = (folderlessData.lists ?? []).map(
    (l: { id: string; name: string }) => ({ id: l.id, name: l.name })
  );

  if (!foldersRes.ok) {
    return folderlessLists;
  }

  const foldersData = await foldersRes.json();
  const folders: { id: string; name: string; lists: { id: string; name: string }[] }[] =
    foldersData.folders ?? [];

  const folderLists: ClickUpList[] = folders.flatMap((f) =>
    (f.lists ?? []).map((l) => ({ id: l.id, name: `${f.name} / ${l.name}` }))
  );

  return [...folderlessLists, ...folderLists];
}

export async function createTask(
  token: string,
  listId: string,
  task: ClickUpTaskPayload
): Promise<void> {
  const res = await clickupFetch(token, `/list/${listId}/task`, {
    method: "POST",
    body: JSON.stringify({
      name: task.name,
      description: task.description,
      priority: task.priority,
      tags: task.tags,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `ClickUp createTask failed: ${res.status} ${res.statusText} — ${detail}`
    );
  }
}
