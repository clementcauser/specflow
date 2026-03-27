import { OAuth } from "oauth";

const REQUEST_TOKEN_URL = "https://trello.com/1/OAuthGetRequestToken";
const ACCESS_TOKEN_URL = "https://trello.com/1/OAuthGetAccessToken";
const AUTHORIZE_URL = "https://trello.com/1/OAuthAuthorizeToken";

export function getTrelloOAuthClient(): OAuth {
  const apiKey = process.env.TRELLO_API_KEY;
  const apiSecret = process.env.TRELLO_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("TRELLO_API_KEY and TRELLO_API_SECRET must be set");
  }

  const redirectUri =
    process.env.TRELLO_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/trello/callback`;

  return new OAuth(
    REQUEST_TOKEN_URL,
    ACCESS_TOKEN_URL,
    apiKey,
    apiSecret,
    "1.0A",
    redirectUri,
    "HMAC-SHA1"
  );
}

export function getRequestToken(): Promise<{
  token: string;
  tokenSecret: string;
}> {
  const client = getTrelloOAuthClient();

  return new Promise((resolve, reject) => {
    client.getOAuthRequestToken((err, token, tokenSecret) => {
      if (err) {
        reject(new Error(`Trello getRequestToken failed: ${JSON.stringify(err)}`));
        return;
      }
      resolve({ token, tokenSecret });
    });
  });
}

export function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  oauthVerifier: string
): Promise<{ token: string; tokenSecret: string }> {
  const client = getTrelloOAuthClient();

  return new Promise((resolve, reject) => {
    client.getOAuthAccessToken(
      requestToken,
      requestTokenSecret,
      oauthVerifier,
      (err, token, tokenSecret) => {
        if (err) {
          reject(
            new Error(`Trello getAccessToken failed: ${JSON.stringify(err)}`)
          );
          return;
        }
        resolve({ token, tokenSecret });
      }
    );
  });
}

export { AUTHORIZE_URL };
