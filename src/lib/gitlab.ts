const GITLAB_API_BASE = "https://gitlab.com/api/v4";

export interface GitRepo {
  id: number;
  full_name: string;
  name: string;
  owner: string;
}

export interface GitIssuePayload {
  title: string;
  body: string;
  labels: string[];
}

const MOSCOW_LABELS = [
  { name: "MUST", color: "#d73a4a", description: "Must have - MoSCoW priority" },
  { name: "SHOULD", color: "#e4a733", description: "Should have - MoSCoW priority" },
  { name: "COULD", color: "#0e8a16", description: "Could have - MoSCoW priority" },
  { name: "WONT", color: "#cfd3d7", description: "Won't have - MoSCoW priority" },
];

function gitlabHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function listRepos(token: string): Promise<GitRepo[]> {
  const res = await fetch(
    `${GITLAB_API_BASE}/projects?membership=true&per_page=100&order_by=last_activity_at`,
    { headers: gitlabHeaders(token) }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitLab listRepos failed: ${error}`);
  }

  const data = await res.json();
  return data.map(
    (r: {
      id: number;
      path_with_namespace: string;
      name: string;
      namespace: { path: string };
    }) => ({
      id: r.id,
      full_name: r.path_with_namespace,
      name: r.name,
      owner: r.namespace.path,
    })
  );
}

export async function ensureLabels(token: string, projectId: number): Promise<void> {
  const existingRes = await fetch(
    `${GITLAB_API_BASE}/projects/${projectId}/labels?per_page=100`,
    { headers: gitlabHeaders(token) }
  );

  const existing: Array<{ name: string }> = existingRes.ok
    ? await existingRes.json()
    : [];
  const existingNames = new Set(existing.map((l) => l.name));

  for (const label of MOSCOW_LABELS) {
    if (!existingNames.has(label.name)) {
      await fetch(`${GITLAB_API_BASE}/projects/${projectId}/labels`, {
        method: "POST",
        headers: gitlabHeaders(token),
        body: JSON.stringify({
          name: label.name,
          color: label.color,
          description: label.description,
        }),
      });
    }
  }
}

export async function createIssue(
  token: string,
  projectId: number,
  issue: GitIssuePayload
): Promise<{ url: string; iid: number }> {
  const res = await fetch(`${GITLAB_API_BASE}/projects/${projectId}/issues`, {
    method: "POST",
    headers: gitlabHeaders(token),
    body: JSON.stringify({
      title: issue.title,
      description: issue.body,
      labels: issue.labels.join(","),
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitLab createIssue failed: ${error}`);
  }

  const data = await res.json();
  return { url: data.web_url, iid: data.iid };
}

export interface GitLabOAuthTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  scope: string;
}

export interface GitLabUser {
  id: number;
  username: string;
}

export async function exchangeGitLabCode(
  code: string,
  redirectUri: string
): Promise<GitLabOAuthTokenResponse> {
  const res = await fetch("https://gitlab.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITLAB_CLIENT_ID,
      client_secret: process.env.GITLAB_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitLab token exchange failed: ${error}`);
  }

  return res.json();
}

export async function refreshGitLabToken(
  refreshToken: string
): Promise<GitLabOAuthTokenResponse> {
  const res = await fetch("https://gitlab.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITLAB_CLIENT_ID,
      client_secret: process.env.GITLAB_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitLab token refresh failed: ${error}`);
  }

  return res.json();
}

export async function getGitLabUser(token: string): Promise<GitLabUser> {
  const res = await fetch(`${GITLAB_API_BASE}/user`, {
    headers: gitlabHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`GitLab user fetch failed: ${res.status}`);
  }

  return res.json();
}
