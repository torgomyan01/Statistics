import { headers } from "next/headers";
import { ActionGetSelectedCountry } from "@/app/actions/industry/get";
import { createSlug } from "@/utils/helpers";
import { ActionGetAllCountry } from "./actions/counrty/get";

export default async function sitemap() {
  const headersList = await headers();
  const host = await headersList.get("host");
  const proto = await headersList.get("x-forwarded-proto");

  const { data } = await ActionGetAllCountry();

  const _vs = [];

  for (const item of data) {
    for (const country of data) {
      _vs.push([item.nicename, country.nicename]);
    }
  }

  const res: any = _vs.map((post: any) => {
    return {
      url: `${proto}://${host}/${post[0]}-vs-${post[1]}-comparison`,
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
