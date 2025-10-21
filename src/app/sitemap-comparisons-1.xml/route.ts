import { headers } from "next/headers";
import { createSlug } from "@/utils/helpers";
import { ActionGetAllCountry } from "../actions/counrty/get";

export async function GET() {
  const headersList = await headers();
  const host = await headersList.get("host");
  const proto = await headersList.get("x-forwarded-proto");

  const { data } = await ActionGetAllCountry();

  // Split countries into 2 parts
  const midPoint = Math.ceil(data.length / 2);
  const firstHalf = data.slice(0, midPoint);

  const _vs = [];

  // Generate combinations for first half vs all countries
  for (const item of firstHalf) {
    for (const country of data) {
      if (item.nicename !== country.nicename) {
        _vs.push([item.nicename, country.nicename]);
      }
    }
  }

  const urls = _vs
    .map((post: any) => {
      return `  <url>
    <loc>${proto}://${host}/comparison/${createSlug(post[0])}-vs-${createSlug(post[1])}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
