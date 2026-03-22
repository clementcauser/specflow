import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://specflow.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login", "/register", "/onboarding/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
