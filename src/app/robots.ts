import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/specs/",
          "/epics/",
          "/clients/",
          "/projects/",
          "/settings/",
          "/workspaces/",
          "/plans/",
          "/api/",
          "/onboarding/",
          "/invite/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
