import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAccessToken } from "@/lib/trello-oauth";
import { getTrelloMemberMe } from "@/lib/trello";

export const runtime = "nodejs";

const COOKIE_NAME = "trello_request_token_secret";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { searchParams } = request.nextUrl;

  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");

  if (!oauthToken || !oauthVerifier) {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=trello_denied`
    );
  }

  // Read the httpOnly cookie
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;

  if (!cookieValue) {
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=trello_session_expired`
    );
  }

  let tokenSecret: string;
  let workspaceId: string;

  try {
    const parsed = JSON.parse(cookieValue);
    tokenSecret = parsed.tokenSecret;
    workspaceId = parsed.workspaceId;
  } catch {
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=trello_invalid_cookie`
    );
  }

  // Verify the user is OWNER or ADMIN in that workspace
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return Response.redirect(
      `${appUrl}/settings/integrations?error=forbidden`
    );
  }

  try {
    const { token: accessToken, tokenSecret: accessTokenSecret } =
      await getAccessToken(oauthToken, tokenSecret, oauthVerifier);

    const me = await getTrelloMemberMe(accessToken, accessTokenSecret);

    await prisma.trelloIntegration.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        accessToken,
        accessTokenSecret,
        trelloMemberId: me.id,
        trelloFullName: me.fullName,
        trelloUsername: me.username,
      },
      update: {
        accessToken,
        accessTokenSecret,
        trelloMemberId: me.id,
        trelloFullName: me.fullName,
        trelloUsername: me.username,
      },
    });

    // Clear the temporary cookie
    const response = NextResponse.redirect(
      `${appUrl}/settings/integrations?trello=connected`
    );
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return response;
  } catch {
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=trello_token_exchange`
    );
  }
}
