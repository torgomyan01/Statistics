"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActionGetAllCountry } from "@/app/actions/counrty/get";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import people_info from "@/access/people_info.json";
import MainTemplate from "@/components/common/main-template/main-template";
import RightInfo from "@/components/pages/home/right-info";
import { useSelector } from "react-redux";
import { ActionGetManyInfo } from "@/app/actions/industry/get-many";
import clsx from "clsx";
const peopleData: any = people_info;

function Page() {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [selectedIsoCodeOne, setSelectedIsoCodeOne] = useState<
    string | number | null
  >(null);
  const [selectedIsoCodeTwo, setSelectedIsoCodeTwo] = useState<
    string | number | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { selectedIndicator, selectedScoreYear } = useSelector(
    (state: IStateSiteInfo) => state.siteInfo,
  );

  useEffect(() => {
    // Տվյալների բեռնում
    ActionGetAllCountry().then(({ data }) => {
      setCountries(data as ICountry[]);
    });
  }, []);

  const isoOne = (selectedIsoCodeOne as string) || "";
  const isoTwo = (selectedIsoCodeTwo as string) || "";

  const populationByCode = useMemo(() => {
    const map: Record<string, any> = {};
    (peopleData as any[]).forEach((row: any) => {
      if (row["Indicator Name"] === "Population, total") {
        map[row["Country Code"]] = row;
      }
    });
    return map;
  }, []);

  const areaByCode = useMemo(() => {
    const map: Record<string, any> = {};
    (peopleData as any[]).forEach((row: any) => {
      if (row["Indicator Name"] === "Surface area (sq. km)") {
        map[row["Country Code"]] = row;
      }
    });
    return map;
  }, []);

  const countryNameByIso3 = useMemo(() => {
    const map = new Map<string, string>();
    countries.forEach((c) => {
      if (c.iso3) {
        map.set(c.iso3, c.name);
      }
    });
    return map;
  }, [countries]);

  const countryOneName = isoOne
    ? countryNameByIso3.get(isoOne) || "Country 1"
    : "Country 1";
  const countryTwoName = isoTwo
    ? countryNameByIso3.get(isoTwo) || "Country 2"
    : "Country 2";

  // Indicator cache and progressive loading per code
  const indicatorCacheRef = useRef<Map<string, ICountryData[]>>(new Map());
  const [indicatorDatasets, setIndicatorDatasets] = useState<
    Record<string, ICountryData[]>
  >({});

  useEffect(() => {
    let isMounted = true;
    if (!selectedIndicator?.length) {
      setIndicatorDatasets({});
      setIsLoading(false);
      return;
    }

    // Seed from cache immediately for instant rendering
    const seeded: Record<string, ICountryData[]> = {} as any;
    selectedIndicator.forEach((code) => {
      const cached = indicatorCacheRef.current.get(code);
      if (cached) {
        seeded[code] = cached;
      }
    });
    if (Object.keys(seeded).length) {
      setIndicatorDatasets((prev) => ({ ...prev, ...seeded }));
    }

    // Fetch only missing indicators, update state incrementally
    const missing = selectedIndicator.filter(
      (code) => !indicatorCacheRef.current.has(code),
    );

    if (!missing.length) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    ActionGetManyInfo(missing).then((resp) => {
      if (!isMounted) {
        return;
      }
      const rows = (resp.data || []) as ICountryData[];
      const grouped = new Map<string, ICountryData[]>();
      rows.forEach((row) => {
        const arr = grouped.get(row.indicator_code) || [];
        arr.push(row);
        grouped.set(row.indicator_code, arr);
      });
      const next: Record<string, ICountryData[]> = {} as any;
      missing.forEach((code) => {
        const arr = grouped.get(code) || [];
        indicatorCacheRef.current.set(code, arr);
        next[code] = arr;
      });
      setIndicatorDatasets((prev) => ({ ...prev, ...next }));
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedIndicator]);

  // Trigger lightweight recalculation signal without blocking UI
  useEffect(() => {
    if (!isoOne || !isoTwo) {
      return;
    }
    const id = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(id);
  }, [isoOne, isoTwo, selectedScoreYear, indicatorDatasets]);

  const ranksByIndicator = useMemo(() => {
    const result: Record<string, Map<string, number>> = {};
    const scoreKey = `${selectedScoreYear}_score`;

    Object.entries(indicatorDatasets).forEach(([code, list]) => {
      const valid = (list || []).filter((row) => {
        const val = row.object?.[scoreKey];
        return val !== undefined && val !== null && val !== "";
      });
      if (!valid.length) {
        result[code] = new Map();
        return;
      }

      const isDescending = (valid[0]?.object?.descending || "TRUE") === "TRUE";
      valid.sort((a, b) => {
        const av = +a.object[scoreKey];
        const bv = +b.object[scoreKey];
        return isDescending ? bv - av : av - bv;
      });

      const rankMap = new Map<string, number>();
      valid.forEach((row, idx) => {
        rankMap.set(row.country_code, idx + 1);
      });
      result[code] = rankMap;
    });

    return result;
  }, [indicatorDatasets, selectedScoreYear]);

  const comparisonRows = useMemo(() => {
    const rows: {
      metric: string;
      v1: string | number;
      v2: string | number;
      r1: number | null;
      r2: number | null;
    }[] = [];
    // // Population
    // const popOne = (populationByCode[isoOne] || {})[selectedScoreYear] || 0;
    // const popTwo = (populationByCode[isoTwo] || {})[selectedScoreYear] || 0;
    // rows.push({
    //   metric: "Population, total",
    //   v1: (popOne as number).toLocaleString(),
    //   v2: (popTwo as number).toLocaleString(),
    // });

    // // Area
    // const areaOne = (areaByCode[isoOne] || {})[selectedScoreYear] || 0;
    // const areaTwo = (areaByCode[isoTwo] || {})[selectedScoreYear] || 0;
    // rows.push({
    //   metric: "Surface area (sq. km)",
    //   v1: (areaOne as number).toLocaleString(),
    //   v2: (areaTwo as number).toLocaleString(),
    // });

    // Indicators
    selectedIndicator?.forEach((code) => {
      const list = indicatorDatasets[code] || [];
      if (!list.length) {
        return;
      }
      const scoreKey = `${selectedScoreYear}_score`;
      const valid = list.filter((row) => {
        const val = row.object?.[scoreKey];
        return val !== undefined && val !== null && val !== "";
      });

      const countWithRank = valid.length;

      const rankMap = ranksByIndicator[code] || new Map<string, number>();

      const r1 = rankMap.get(isoOne) ?? null;
      const r2 = rankMap.get(isoTwo) ?? null;

      const one = list.find((x) => x.country_code === isoOne);
      const two = list.find((x) => x.country_code === isoTwo);
      const metricName = one?.Indicator_name || two?.Indicator_name || code;

      const scoreOne = one?.object[selectedScoreYear].split(".")[0] ?? 0;
      const scoreTwo = two?.object[selectedScoreYear].split(".")[0] ?? 0;

      // Format numbers with comma separators
      const formatNumber = (num: string | number) => {
        const numValue = typeof num === "string" ? parseInt(num) : num;
        return isNaN(numValue) ? "" : numValue.toLocaleString("en-US");
      };

      const formattedScoreOne = formatNumber(scoreOne);
      const formattedScoreTwo = formatNumber(scoreTwo);

      const v1 =
        r1 !== null
          ? `${formattedScoreOne} (${r1}/${countWithRank})`
          : `${formattedScoreOne} -`;

      const v2 =
        r2 !== null
          ? `${formattedScoreTwo} (${r2}/${countWithRank})`
          : `${formattedScoreTwo} -`;

      rows.push({ metric: metricName, v1, v2, r1, r2 });
    });

    return rows;
  }, [
    isoOne,
    isoTwo,
    populationByCode,
    areaByCode,
    selectedScoreYear,
    selectedIndicator,
    indicatorDatasets,
    ranksByIndicator,
  ]);

  return (
    <MainTemplate>
      <div className="w-full h-full overflow-y-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-500 font-inter">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl mb-12 border-t-4 border-indigo-600 dark:border-indigo-500 transition-colors duration-500">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
              Select Countries for Comparison
            </h2>
            <div className="flex flex-col md:flex-row gap-8 justify-around">
              <Autocomplete
                className="w-full md:max-w-xs"
                label="Select country 1"
                radius="sm"
                onSelectionChange={(key) => setSelectedIsoCodeOne(key)}
              >
                {countries.map((country: ICountry) => (
                  <AutocompleteItem
                    key={country.iso3}
                    startContent={
                      <Avatar
                        alt={country.name}
                        radius="none"
                        className="w-6 h-6"
                        src={`https://flagcdn.com/${country.iso.toLowerCase()}.svg`}
                      />
                    }
                  >
                    {country.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              <Autocomplete
                className="w-full md:max-w-xs"
                label="Select country 2"
                radius="sm"
                onSelectionChange={(key) => setSelectedIsoCodeTwo(key)} // Ավելացրել ենք onSelectionChange
              >
                {countries.map((country: ICountry) => (
                  <AutocompleteItem
                    key={country.iso3} // Փոխել ենք country.name-ը country.iso3-ով
                    startContent={
                      <Avatar
                        alt={country.name}
                        radius="none"
                        className="w-6 h-6"
                        src={`https://flagcdn.com/${country.iso.toLowerCase()}.svg`}
                      />
                    }
                  >
                    {country.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>

            <div className="relative mt-6">
              <RightInfo absolute={false} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl transition-colors duration-500">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 flex items-center gap-3">
              <span>
                Comparative Statistics ({countryOneName} vs {countryTwoName})
              </span>
              {isLoading && (
                <Spinner size="sm" color="primary" label={undefined} />
              )}
            </h2>

            <div className="rounded-xl dark:border-gray-700 flex justify-between gap-6">
              {isoOne && isoTwo ? (
                <Table
                  aria-label="Comparative statistics table"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden"
                  shadow="none"
                  isHeaderSticky
                  isStriped
                  selectionMode="single"
                >
                  <TableHeader>
                    <TableColumn
                      key="metric"
                      className="text-gray-900 dark:text-white"
                    >
                      Metric
                    </TableColumn>
                    <TableColumn
                      key="country1"
                      className="text-gray-900 dark:text-white"
                    >
                      {countryOneName}
                    </TableColumn>
                    <TableColumn
                      key="country2"
                      className="text-gray-900 dark:text-white"
                    >
                      {countryTwoName}
                    </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.metric}>
                        <TableCell
                          width="50%"
                          className="font-semibold text-gray-900 dark:text-white"
                        >
                          {row.metric}
                        </TableCell>
                        <TableCell
                          className={clsx("text-gray-900 dark:text-white", {
                            "bg-green-200 dark:bg-green-800":
                              typeof row.v1 === "string" && row.v1.includes("-")
                                ? false
                                : (row.r2 || 0) > (row.r1 || 0),
                          })}
                        >
                          {row.v1}
                        </TableCell>
                        <TableCell
                          className={clsx("text-gray-900 dark:text-white", {
                            "bg-green-200 dark:bg-green-800":
                              typeof row.v2 === "string" && row.v2.includes("-")
                                ? false
                                : (row.r2 || 0) < (row.r1 || 0),
                          })}
                        >
                          {row.v2}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center w-full py-10 text-gray-600 dark:text-gray-400">
                  Please select two countries for comparison.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </MainTemplate>
  );
}

export default Page;
