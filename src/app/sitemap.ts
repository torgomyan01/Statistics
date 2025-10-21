import { headers } from "next/headers";

export default async function sitemap() {
  const headersList = await headers();
  const host = await headersList.get("host");
  const proto = await headersList.get("x-forwarded-proto");

  return [
    {
      url: `${proto}://${host}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${proto}://${host}/sitemap-comparisons-1.xml`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${proto}://${host}/sitemap-comparisons-2.xml`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
