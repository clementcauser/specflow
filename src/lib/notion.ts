const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionPage {
  id: string;
  title: string;
  url: string;
}

export interface NotionOAuthTokenResponse {
  access_token: string;
  workspace_id: string;
  workspace_name: string;
  workspace_icon: string | null;
  bot_id: string;
}

function notionHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export async function exchangeNotionCode(
  code: string,
  redirectUri: string
): Promise<NotionOAuthTokenResponse> {
  const clientId = process.env.NOTION_CLIENT_ID!;
  const clientSecret = process.env.NOTION_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${NOTION_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Notion token exchange failed: ${error}`);
  }

  return res.json();
}

export async function listNotionPages(accessToken: string): Promise<NotionPage[]> {
  const res = await fetch(`${NOTION_API_BASE}/search`, {
    method: "POST",
    headers: notionHeaders(accessToken),
    body: JSON.stringify({
      filter: { value: "page", property: "object" },
      sort: { direction: "descending", timestamp: "last_edited_time" },
      page_size: 50,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Notion search failed: ${error}`);
  }

  const data = await res.json();

  return (data.results ?? []).map((page: NotionSearchResult) => ({
    id: page.id,
    title: extractPageTitle(page),
    url: page.url,
  }));
}

interface NotionSearchResult {
  id: string;
  url: string;
  properties?: {
    title?: {
      title?: Array<{ plain_text: string }>;
    };
  };
  title?: Array<{ plain_text: string }>;
}

function extractPageTitle(page: NotionSearchResult): string {
  // Database pages have properties.title, regular pages have title directly
  const titleProp = page.properties?.title?.title;
  if (titleProp && titleProp.length > 0) {
    return titleProp.map((t) => t.plain_text).join("") || "Sans titre";
  }
  if (page.title && page.title.length > 0) {
    return page.title.map((t) => t.plain_text).join("") || "Sans titre";
  }
  return "Sans titre";
}

export interface NotionBlock {
  object: "block";
  type: string;
  [key: string]: unknown;
}

export async function createNotionPage(
  accessToken: string,
  parentPageId: string,
  title: string,
  blocks: NotionBlock[]
): Promise<{ id: string; url: string }> {
  // Create the page with the first batch of blocks (max 100)
  const res = await fetch(`${NOTION_API_BASE}/pages`, {
    method: "POST",
    headers: notionHeaders(accessToken),
    body: JSON.stringify({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: title } }],
        },
      },
      children: blocks.slice(0, 100),
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Notion page creation failed: ${error}`);
  }

  const page = await res.json();

  // Append remaining blocks in batches of 100
  if (blocks.length > 100) {
    await appendBlocksInBatches(accessToken, page.id, blocks.slice(100));
  }

  return { id: page.id, url: page.url };
}

async function appendBlocksInBatches(
  accessToken: string,
  blockId: string,
  blocks: NotionBlock[]
): Promise<void> {
  const BATCH_SIZE = 100;

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);

    const res = await fetch(`${NOTION_API_BASE}/blocks/${blockId}/children`, {
      method: "PATCH",
      headers: notionHeaders(accessToken),
      body: JSON.stringify({ children: batch }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Notion append blocks failed: ${error}`);
    }
  }
}
