"use server";

export async function createCheckoutSession(workspaceId: string, priceId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const response = await fetch(`${appUrl}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, priceId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { error?: string }).error ?? "Checkout session creation failed");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function createPortalSession(workspaceId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const response = await fetch(`${appUrl}/api/stripe/portal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { error?: string }).error ?? "Portal session creation failed");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
