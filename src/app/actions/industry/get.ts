"use server";

import { prisma } from "@/lib/prisma";

export async function ActionGetSelectedCountry() {
  try {
    const res = await prisma.countries.findMany({
      where: {
        country_code: "USA",
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

export async function ActionGetIndicatorsWithCountryScores() {
  try {
    // Get all unique indicators first
    const uniqueIndicators = await prisma.countries.findMany({
      select: {
        indicator_code: true,
        Indicator_name: true,
      },
      distinct: ["indicator_code"],
    });

    // Group data by indicator_code for better performance
    const groupedData: Record<
      string,
      {
        indicator_name: string;
        countries: Array<{
          country_name: string;
          country_code: string;
          "2024_score": any;
        }>;
      }
    > = {};

    // Initialize all indicators
    uniqueIndicators.forEach((indicator) => {
      groupedData[indicator.indicator_code] = {
        indicator_name: indicator.Indicator_name,
        countries: [],
      };
    });

    // Get all countries with their 2024 scores for each indicator
    // Process in batches to handle large dataset
    const batchSize = 10000;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await prisma.countries.findMany({
        select: {
          country_name: true,
          country_code: true,
          indicator_code: true,
          object: true,
        },
        skip,
        take: batchSize,
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      batch.forEach((item) => {
        const object = item.object as any;
        const score2024 = object?.["2024"];

        // Only include if 2024 score exists and is not empty
        if (score2024 !== undefined && score2024 !== null && score2024 !== "") {
          if (groupedData[item.indicator_code]) {
            groupedData[item.indicator_code].countries.push({
              country_name: item.country_name,
              country_code: item.country_code,
              "2024_score": score2024,
            });
          }
        }
      });

      skip += batchSize;
    }

    // Convert to the desired format
    const result = Object.entries(groupedData).map(([indicatorCode, data]) => ({
      indicator_code: indicatorCode,
      indicator_name: data.indicator_name,
      countries: data.countries,
    }));

    // Sort by number of countries with data (descending)
    result.sort((a, b) => b.countries.length - a.countries.length);

    return {
      status: "ok",
      data: result,
      error: "",
    };
  } catch (error) {
    return {
      status: "error",
      data: [],
      error: "An unknown error occurred",
    };
  }
}

// More efficient version using raw SQL for large datasets
export async function ActionGetIndicatorsWithCountryScoresOptimized(
  year: number = 2023,
) {
  try {
    // Use raw SQL for better performance with large dataset
    const result = (await prisma.$queryRaw`
      SELECT 
        indicator_code,
        Indicator_name,
        MAX(JSON_UNQUOTE(JSON_EXTRACT(object, '$.group'))) as group_name,
        COUNT(DISTINCT country_code) as country_count
      FROM countries 
      WHERE JSON_UNQUOTE(JSON_EXTRACT(object, '$."${year}"')) IS NOT NULL 
      AND TRIM(JSON_UNQUOTE(JSON_EXTRACT(object, '$."${year}"'))) != ''
      AND JSON_UNQUOTE(JSON_EXTRACT(object, '$."${year}"')) != 'null'
      AND JSON_UNQUOTE(JSON_EXTRACT(object, '$."${year}"')) != 'undefined'
      AND LENGTH(TRIM(JSON_UNQUOTE(JSON_EXTRACT(object, '$."${year}"')))) > 0
      GROUP BY indicator_code, Indicator_name
      ORDER BY country_count DESC
    `) as any[];

    // Process the result to match our expected format
    const processedResult = result.map((row: any) => ({
      indicator_code: row.indicator_code,
      indicator_name: row.Indicator_name,
      group: row.group_name,
      country_count: Number(row.country_count),
    }));

    return {
      status: "ok",
      data: processedResult,
      error: "",
    };
  } catch (error) {
    return {
      status: "error",
      data: [],
      error: `An unknown error occurred: ${error}`,
    };
  }
}

// Get all indicators with country counts using SQL (including those without 2024 data)
export async function ActionGetAllIndicatorsWithCountryCounts(
  year: number = 2023,
) {
  try {
    // Fix ONLY_FULL_GROUP_BY error by using an aggregate for group_name (e.g. MAX)
    const allIndicators = (await prisma.$queryRaw`
      SELECT
        indicator_code,
        Indicator_name,
        MAX(JSON_UNQUOTE(JSON_EXTRACT(object, '$.group'))) as group_name
      FROM countries
      WHERE country_code = 'USA'
      GROUP BY indicator_code, Indicator_name
    `) as any[];

    // Then get counts for indicators with data for the specified year
    const indicatorsWithData = (await prisma.$queryRaw`
      SELECT 
        indicator_code,
        COUNT(DISTINCT country_code) as country_count
      FROM countries 
      WHERE JSON_UNQUOTE(JSON_EXTRACT(object, CONCAT('$."', ${year}, '"'))) IS NOT NULL 
      AND TRIM(JSON_UNQUOTE(JSON_EXTRACT(object, CONCAT('$."', ${year}, '"')))) != ''
      AND JSON_UNQUOTE(JSON_EXTRACT(object, CONCAT('$."', ${year}, '"'))) != 'null'
      AND JSON_UNQUOTE(JSON_EXTRACT(object, CONCAT('$."', ${year}, '"'))) != 'undefined'
      AND LENGTH(TRIM(JSON_UNQUOTE(JSON_EXTRACT(object, CONCAT('$."', ${year}, '"'))))) > 0
      GROUP BY indicator_code
    `) as any[];

    // Create a map for quick lookup
    const dataMap = new Map();
    indicatorsWithData.forEach((item: any) => {
      dataMap.set(item.indicator_code, Number(item.country_count));
    });

    // Combine all indicators with their counts
    const result = allIndicators.map((indicator: any) => ({
      indicator_code: indicator.indicator_code,
      indicator_name: indicator.Indicator_name,
      group: indicator.group_name,
      country_count: dataMap.get(indicator.indicator_code) || 0,
    }));

    // Sort by country count (descending)
    result.sort((a, b) => b.country_count - a.country_count);

    return {
      status: "ok",
      data: result,
      error: "",
    };
  } catch (error) {
    return {
      status: "error",
      data: [],
      error: `An unknown error occurred: ${error}`,
    };
  }
}
