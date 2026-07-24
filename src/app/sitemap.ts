import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eduearn.com";

  const staticRoutes = [
    "",
    "/tutor/onboarding",
    "/live-classes",
    "/pricing",
    "/blog",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/courses",
    "/ai-assistant",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
