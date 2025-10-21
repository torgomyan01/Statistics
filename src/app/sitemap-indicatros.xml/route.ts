import { headers } from "next/headers";
import { createSlug } from "@/utils/helpers";
import { ActionGetSelectedCountry } from "../actions/industry/get";

export async function GET() {
  const headersList = await headers();
  const host = await headersList.get("host");
  const proto = await headersList.get("x-forwarded-proto");

  const { data } = await ActionGetSelectedCountry();

  const urls = data
    .map((item: any) => {
      return `  <url>
    <loc>${proto}://${host}/${item.indicator_code}/${createSlug(item.Indicator_name)}</loc>
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
