const GITHUB_API_BASE = "https://api.github.com";

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
  { name: "MUST", color: "d73a4a", description: "Must have - MoSCoW priority" },
  { name: "SHOULD", color: "e4a733", description: "Should have - MoSCoW priority" },
  { name: "COULD", color: "0e8a16", description: "Could have - MoSCoW priority" },
  { name: "WONT", color: "cfd3d7", description: "Won't have - MoSCoW priority" },
];

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function fetchWithRateLimitRetry(
  url: string,
  options: RequestInit
): Promise<Response> {
  const res = await fetch(url, options);

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60_000;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return fetch(url, options);
  }

  return res;
}

export async function listRepos(token: string): Promise<GitRepo[]> {
  const res = await fetchWithRateLimitRetry(
    `${GITHUB_API_BASE}/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member`,
    { headers: githubHeaders(token) }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub listRepos failed: ${error}`);
  }

  const data = await res.json();
  return data.map(
    (r: { id: number; full_name: string; name: string; owner: { login: string } }) => ({
      id: r.id,
      full_name: r.full_name,
      name: r.name,
      owner: r.owner.login,
    })
  );
}

export async function ensureLabels(
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  for (const label of MOSCOW_LABELS) {
    const checkRes = await fetchWithRateLimitRetry(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/labels/${encodeURIComponent(label.name)}`,
      { headers: githubHeaders(token) }
    );

    if (checkRes.status === 404) {
      await fetchWithRateLimitRetry(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/labels`,
        {
          method: "POST",
          headers: githubHeaders(token),
          body: JSON.stringify(label),
        }
      );
    }
  }
}

export async function createIssue(
  token: string,
  owner: string,
  repo: string,
  issue: GitIssuePayload
): Promise<{ url: string; number: number }> {
  const res = await fetchWithRateLimitRetry(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: githubHeaders(token),
      body: JSON.stringify({
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub createIssue failed: ${error}`);
  }

  const data = await res.json();
  return { url: data.html_url, number: data.number };
}

export interface GitHubOAuthTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface GitHubUser {
  id: number;
  login: string;
}

export async function exchangeGitHubCode(
  code: string,
  redirectUri: string
): Promise<GitHubOAuthTokenResponse> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`GitHub token exchange error: ${data.error_description}`);
  }

  return data;
}

export async function getGitHubUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: githubHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`GitHub user fetch failed: ${res.status}`);
  }

  return res.json();
}
