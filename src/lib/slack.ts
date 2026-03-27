import { prisma } from "@/lib/prisma";

const SLACK_API_BASE = "https://slack.com/api";

export interface SlackChannel {
  id: string;
  name: string;
}

export interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  bot_user_id?: string;
  team?: {
    id: string;
    name: string;
  };
  error?: string;
}

export async function exchangeSlackCode(
  code: string,
  redirectUri: string
): Promise<SlackOAuthResponse> {
  const clientId = process.env.SLACK_CLIENT_ID!;
  const clientSecret = process.env.SLACK_CLIENT_SECRET!;

  const res = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Slack token exchange HTTP error: ${res.status}`);
  }

  const data: SlackOAuthResponse = await res.json();
  if (!data.ok) {
    throw new Error(`Slack token exchange failed: ${data.error ?? "unknown"}`);
  }

  return data;
}

export async function listSlackChannels(accessToken: string): Promise<SlackChannel[]> {
  const url = new URL(`${SLACK_API_BASE}/conversations.list`);
  url.searchParams.set("types", "public_channel");
  url.searchParams.set("limit", "200");
  url.searchParams.set("exclude_archived", "true");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Slack conversations.list HTTP error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return (data.channels ?? []).map((ch: { id: string; name: string }) => ({
    id: ch.id,
    name: ch.name,
  }));
}

export async function getSlackClient(workspaceId: string) {
  const integration = await prisma.slackIntegration.findUnique({
    where: { workspaceId },
    select: { accessToken: true },
  });

  if (!integration) return null;

  const { accessToken } = integration;

  return {
    async postMessage(
      channelId: string,
      blocks: object[],
      text: string
    ): Promise<void> {
      const res = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel: channelId, blocks, text }),
      });

      if (!res.ok) {
        throw new Error(`Slack postMessage HTTP error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }
    },
  };
}

export async function sendSpecNotification(
  workspaceId: string,
  payload: {
    specTitle: string;
    projectName: string;
    specUrl: string;
    exportType?: string;
  }
): Promise<void> {
  let integration: { accessToken: string; defaultChannelId: string | null } | null;
  try {
    integration = await prisma.slackIntegration.findUnique({
      where: { workspaceId },
      select: { accessToken: true, defaultChannelId: true },
    });
  } catch {
    return;
  }

  if (!integration?.defaultChannelId) return;

  const { accessToken, defaultChannelId } = integration;
  const { specTitle, projectName, specUrl, exportType } = payload;

  const blocks: object[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: exportType
          ? `:page_facing_up: *${specTitle}*\nProjet : ${projectName} · Exporté vers *${exportType}*`
          : `:memo: *${specTitle}*\nProjet : ${projectName}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Voir la spec", emoji: true },
          url: specUrl,
          action_id: "view_spec",
        },
      ],
    },
  ];

  const text = exportType
    ? `Spec "${specTitle}" (${projectName}) exportée vers ${exportType}`
    : `Nouvelle spec générée : "${specTitle}" (${projectName})`;

  try {
    const res = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel: defaultChannelId, blocks, text }),
    });

    if (!res.ok) {
      console.error("[Slack notification] HTTP error:", res.status);
      return;
    }

    const data = await res.json();
    if (!data.ok) {
      console.error("[Slack notification] API error:", data.error);
    }
  } catch (err) {
    console.error("[Slack notification] Unexpected error:", err);
  }
}
