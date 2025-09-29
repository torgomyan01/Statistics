"use server";

import { prisma } from "@/lib/prisma";

export async function ActionGetAllInfo(indicatorCode: string | null = null) {
  try {
    const res = await prisma.countries.findMany({
      where: {
        ...(indicatorCode && { indicator_code: indicatorCode }),
      },
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
