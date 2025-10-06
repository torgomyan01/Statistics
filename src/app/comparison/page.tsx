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
import { ActionGetAllInfo } from "@/app/actions/industry/get-indicatr-code";
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
    let remaining = missing.length;
    missing.forEach((code) => {
      ActionGetAllInfo(code).then((resp) => {
        if (!isMounted) {
          return;
        }
        const data = (resp.data || []) as ICountryData[];
        indicatorCacheRef.current.set(code, data);
        setIndicatorDatasets((prev) => ({ ...prev, [code]: data }));
        remaining -= 1;
        if (remaining <= 0) {
          setIsLoading(false);
        }
      });
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
    const rows: { metric: string; v1: string | number; v2: string | number }[] =
      [];
    // Population
    const popOne = (populationByCode[isoOne] || {})[selectedScoreYear] || 0;
    const popTwo = (populationByCode[isoTwo] || {})[selectedScoreYear] || 0;
    rows.push({
      metric: "Population, total",
      v1: (popOne as number).toLocaleString(),
      v2: (popTwo as number).toLocaleString(),
    });

    // Area
    const areaOne = (areaByCode[isoOne] || {})[selectedScoreYear] || 0;
    const areaTwo = (areaByCode[isoTwo] || {})[selectedScoreYear] || 0;
    rows.push({
      metric: "Surface area (sq. km)",
      v1: (areaOne as number).toLocaleString(),
      v2: (areaTwo as number).toLocaleString(),
    });

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
      const v1 = r1 !== null ? `${r1}/${countWithRank}` : `/${countWithRank}`;
      const v2 = r2 !== null ? `${r2}/${countWithRank}` : `/${countWithRank}`;
      rows.push({ metric: metricName, v1, v2 });
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

            <div className="relative">
              <RightInfo absolute={false} />
            </div>
          </div>

          {/* Համեմատական աղյուսակ */}
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
                  className="w-full border border-gray-200 rounded-2xl overflow-hidden"
                  classNames={{
                    base: "max-h-[520px] overflow-scroll",
                    table: "min-h-[400px]",
                  }}
                  shadow="none"
                  isHeaderSticky
                  isStriped
                  selectionMode="single"
                >
                  <TableHeader>
                    <TableColumn key="metric">Metric</TableColumn>
                    <TableColumn key="country1">{countryOneName}</TableColumn>
                    <TableColumn key="country2">{countryTwoName}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.metric}>
                        <TableCell className="font-semibold">
                          {row.metric}
                        </TableCell>
                        <TableCell>
                          {row.v1 || (isLoading ? "…" : "N/A")}
                        </TableCell>
                        <TableCell>
                          {row.v2 || (isLoading ? "…" : "N/A")}
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
