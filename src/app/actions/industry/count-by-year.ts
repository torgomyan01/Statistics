"use server";

import { prisma } from "@/lib/prisma";

type CountResponse = {
  status: "ok" | "error";
  data: Record<string, number>;
  error: string;
};

/**
 * Returns how many countries have a non-empty value for each indicator code in a given year.
 * We compute counts in Node by reading JSON `object` per row and checking the year key.
 */
export async function ActionCountCountriesByYear(
  codes: string[],
  year: number,
): Promise<CountResponse> {
  try {
    if (!Array.isArray(codes) || codes.length === 0) {
      return { status: "ok", data: {}, error: "" };
    }

    const rows = await prisma.countries.findMany({
      where: { indicator_code: { in: codes } },
      select: { indicator_code: true, object: true },
    });

    const byCode = new Map<string, number>();
    const yearKey = String(year);

    rows.forEach((row) => {
      const value = (row as any)?.object?.[yearKey];
      const hasValue = value !== null && value !== undefined && value !== "";
      if (hasValue) {
        const prev = byCode.get(row.indicator_code) || 0;
        byCode.set(row.indicator_code, prev + 1);
      }
    });

    const data: Record<string, number> = {};
    // Ensure we return zero for requested codes with no matches
    codes.forEach((code) => {
      data[code] = byCode.get(code) || 0;
    });

    return { status: "ok", data, error: "" };
  } catch (e) {
    return { status: "error", data: {}, error: "An unknown error occurred" };
  }
}
