import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRequestToken, AUTHORIZE_URL } from "@/lib/trello-oauth";

export const runtime = "nodejs";

// Cookie TTL: 10 minutes
const COOKIE_MAX_AGE = 60 * 10;
const COOKIE_NAME = "trello_request_token_secret";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (!process.env.TRELLO_API_KEY) {
    return new Response("Trello integration not configured", { status: 500 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { activeWorkspaceId: true },
  });

  if (!user.activeWorkspaceId) {
    return new Response("No active workspace", { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  try {
    const { token, tokenSecret } = await getRequestToken();

    const authorizeUrl = new URL(AUTHORIZE_URL);
    authorizeUrl.searchParams.set("oauth_token", token);
    authorizeUrl.searchParams.set("name", "SpecFlow");
    authorizeUrl.searchParams.set("expiration", "never");
    authorizeUrl.searchParams.set("scope", "read,write");

    // Store tokenSecret + workspaceId in a short-lived httpOnly cookie
    const cookieValue = JSON.stringify({
      tokenSecret,
      workspaceId: user.activeWorkspaceId,
    });

    const response = Response.redirect(authorizeUrl.toString());
    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${COOKIE_MAX_AGE}`
    );
    return response;
  } catch {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=trello_request_token`
    );
  }
}
