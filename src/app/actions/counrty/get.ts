"use server";

import { prisma } from "@/lib/prisma";

export async function ActionGetSelectedCountry() {
  try {
    const res = await prisma.countries.findMany({
      where: {
        country_code: "ARM",
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
