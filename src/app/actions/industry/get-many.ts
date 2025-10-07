"use server";

import { prisma } from "@/lib/prisma";

export async function ActionGetManyInfo(codes: string[]) {
  try {
    if (!Array.isArray(codes) || codes.length === 0) {
      return { status: "ok", data: [], error: "" };
    }
    const res = await prisma.countries.findMany({
      where: {
        indicator_code: { in: codes },
      },
    });
    return { status: "ok", data: res, error: "" };
  } catch (e) {
    return { status: "error", data: [], error: "An unknown error occurred" };
  }
}
