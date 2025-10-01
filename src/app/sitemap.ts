import { headers } from "next/headers";
import { ActionGetSelectedCountry } from "@/app/actions/industry/get";
import { createSlug } from "@/utils/helpers";

export default async function sitemap() {
  const headersList = await headers();
  const host = await headersList.get("host");
  const proto = await headersList.get("x-forwarded-proto");

  const { data } = await ActionGetSelectedCountry();

  const res: any = data.map((post: any) => {
    return {
      url: `${proto}://${host}/${post.indicator_code}/${createSlug(post.Indicator_name)}`,
      changeFrequency: "yearly",
      priority: 1,
    };
  });

  return [
    {
      url: `${proto}://${host}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...res,
  ];
}
