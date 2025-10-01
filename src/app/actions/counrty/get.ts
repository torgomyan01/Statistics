"use server";

import { prisma } from "@/lib/prisma";

export async function ActionGetAllCountry() {
  try {
    const res = await prisma.country.findMany();

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
