import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
}

export interface JiraIssuePayload {
  summary: string;
  persona: string;
  action: string;
  benefit: string;
  gherkin: string;
  priority: "MUST" | "SHOULD" | "COULD" | "WONT";
}

export interface JiraCreatedIssue {
  id: string;
  key: string;
}

// ─── Priority mapping ─────────────────────────────────────────────────────────

export function moscowToPriority(
  moscow: "MUST" | "SHOULD" | "COULD" | "WONT"
): string {
  const map: Record<string, string> = {
    MUST: "Highest",
    SHOULD: "High",
    COULD: "Medium",
    WONT: "Low",
  };
  return map[moscow] ?? "Medium";
}

// ─── Token refresh ────────────────────────────────────────────────────────────

export async function refreshJiraToken(workspaceId: string): Promise<string> {
  const integration = await prisma.jiraIntegration.findUniqueOrThrow({
    where: { workspaceId },
    select: { refreshToken: true, expiresAt: true, accessToken: true },
  });

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  if (integration.expiresAt > fiveMinutesFromNow) {
    return integration.accessToken;
  }

  const res = await fetch("https://auth.atlassian.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      refresh_token: integration.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Jira token refresh failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const newAccessToken: string = data.access_token;
  const newRefreshToken: string = data.refresh_token ?? integration.refreshToken;
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000);

  await prisma.jiraIntegration.update({
    where: { workspaceId },
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt },
  });

  return newAccessToken;
}

// ─── Client factory ───────────────────────────────────────────────────────────

export async function getJiraClient(
  workspaceId: string
): Promise<{ token: string; cloudId: string; cloudUrl: string }> {
  const token = await refreshJiraToken(workspaceId);

  const integration = await prisma.jiraIntegration.findUniqueOrThrow({
    where: { workspaceId },
    select: { cloudId: true, cloudUrl: true },
  });

  if (!integration.cloudId || !integration.cloudUrl) {
    throw new Error("Jira site not selected yet. Please complete Jira setup.");
  }

  return { token, cloudId: integration.cloudId, cloudUrl: integration.cloudUrl };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function jiraFetch(
  token: string,
  cloudId: string,
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 60_000));
    return jiraFetch(token, cloudId, path, options);
  }

  return res;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getProjects(workspaceId: string): Promise<JiraProject[]> {
  const { token, cloudId } = await getJiraClient(workspaceId);

  const res = await jiraFetch(token, cloudId, "/project/search?maxResults=100");

  if (!res.ok) {
    throw new Error(`Jira getProjects failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return (data.values ?? []).map(
    (p: { id: string; key: string; name: string }) => ({
      id: p.id,
      key: p.key,
      name: p.name,
    })
  );
}

export async function getIssueTypes(
  workspaceId: string,
  projectKey: string
): Promise<JiraIssueType[]> {
  const { token, cloudId } = await getJiraClient(workspaceId);

  const res = await jiraFetch(token, cloudId, `/issuetype`);

  if (!res.ok) {
    throw new Error(
      `Jira getIssueTypes failed: ${res.status} ${res.statusText}`
    );
  }

  const data: { id: string; name: string; scope?: { project?: { key: string } } }[] =
    await res.json();

  return data
    .filter((t) => {
      const name = t.name.toLowerCase();
      const inScope =
        !t.scope ||
        !t.scope.project ||
        t.scope.project.key === projectKey;
      return (name === "story" || name === "epic") && inScope;
    })
    .map((t) => ({ id: t.id, name: t.name }));
}

export async function createEpic(
  workspaceId: string,
  projectKey: string,
  epicName: string
): Promise<JiraCreatedIssue> {
  const { token, cloudId } = await getJiraClient(workspaceId);

  const res = await jiraFetch(token, cloudId, "/issue", {
    method: "POST",
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: epicName,
        issuetype: { name: "Epic" },
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Epic générée par SpecFlow" },
              ],
            },
          ],
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Jira createEpic failed: ${res.status} ${res.statusText} — ${detail}`
    );
  }

  const data = await res.json();
  return { id: data.id, key: data.key };
}

export async function createIssue(
  workspaceId: string,
  projectKey: string,
  issue: JiraIssuePayload,
  epicKey?: string
): Promise<JiraCreatedIssue> {
  const { token, cloudId } = await getJiraClient(workspaceId);

  const descriptionContent = [];

  if (issue.benefit) {
    descriptionContent.push(
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Objectif" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text:
              issue.benefit.charAt(0).toUpperCase() + issue.benefit.slice(1),
          },
        ],
      }
    );
  }

  if (issue.gherkin) {
    descriptionContent.push(
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Critères d'acceptance" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "gherkin" },
        content: [{ type: "text", text: issue.gherkin }],
      }
    );
  }

  descriptionContent.push({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "---\nGénéré par SpecFlow",
        marks: [{ type: "em" }],
      },
    ],
  });

  const epicFields: Record<string, unknown> = {};
  if (epicKey) {
    epicFields["Epic Link"] = epicKey;
  }

  const payload = {
    fields: {
      project: { key: projectKey },
      summary: issue.summary,
      issuetype: { name: "Story" },
      description: {
        type: "doc",
        version: 1,
        content: descriptionContent,
      },
      priority: { name: moscowToPriority(issue.priority) },
      ...epicFields,
    },
  };

  const res = await jiraFetch(token, cloudId, "/issue", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // If Epic Link field failed, retry without it (some Jira configs don't have this field)
  if (!res.ok && epicKey) {
    const errorText = await res.text();
    const isEpicLinkError =
      errorText.includes("Epic Link") ||
      errorText.includes("customfield") ||
      res.status === 400;

    if (isEpicLinkError) {
      // Fallback: try parent field
      const payloadWithParent = {
        fields: {
          ...payload.fields,
          "Epic Link": undefined,
          parent: { key: epicKey },
        },
      };

      const retryRes = await jiraFetch(token, cloudId, "/issue", {
        method: "POST",
        body: JSON.stringify(payloadWithParent),
      });

      if (!retryRes.ok) {
        // Final fallback: create without epic link
        const payloadWithoutEpic = {
          fields: {
            project: { key: projectKey },
            summary: issue.summary,
            issuetype: { name: "Story" },
            description: payload.fields.description,
            priority: { name: moscowToPriority(issue.priority) },
          },
        };

        const finalRes = await jiraFetch(token, cloudId, "/issue", {
          method: "POST",
          body: JSON.stringify(payloadWithoutEpic),
        });

        if (!finalRes.ok) {
          const detail = await finalRes.text();
          throw new Error(
            `Jira createIssue failed: ${finalRes.status} ${finalRes.statusText} — ${detail}`
          );
        }

        const finalData = await finalRes.json();
        return { id: finalData.id, key: finalData.key };
      }

      const retryData = await retryRes.json();
      return { id: retryData.id, key: retryData.key };
    }

    throw new Error(
      `Jira createIssue failed: ${res.status} ${res.statusText} — ${errorText}`
    );
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Jira createIssue failed: ${res.status} ${res.statusText} — ${detail}`
    );
  }

  const data = await res.json();
  return { id: data.id, key: data.key };
}
