import { MetadataRoute } from "next";
import { eventi } from "@/lib/events";

const BASE_URL = "https://eventicilentoapp.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const eventRoutes = eventi.map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/esperienze`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/locali`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/proponi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...eventRoutes,
  ];
}
