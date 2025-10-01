"use server";

import { prisma } from "@/lib/prisma";

export async function ActionSearchIndicator(searchQuery: string) {
  try {
    const res = await prisma.countries.findMany({
      where: {
        Indicator_name: {
          contains: searchQuery,
        },
      },
      take: 100,
    });

    return {
      status: "ok",
      data: res,
      error: "",
    };
  } catch {
    return {
      status: "error",
      data: [],
      error: "An unknown error occurred",
    };
  }
}
