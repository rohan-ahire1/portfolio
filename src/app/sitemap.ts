import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// One page: section anchors (#work etc.) aren't separate URLs to search engines.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://rohanahire.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
