import {
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import people_info from "@/access/people_info.json";
import RightInfo from "@/components/pages/home/right-info";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatLargeNumber, scoreToColor } from "@/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import { setSelectCountryIso } from "@/redux/info";
import { ActionGetManyInfo } from "@/app/actions/industry/get-many";
import { idbSetIndicatorRows, idbGetManyIndicators } from "@/utils/indexedDb";
import MainTemplate from "@/components/common/main-template/main-template";
import { Spinner } from "@heroui/react";
import SelectCountry from "./select-country";

declare interface ICountryData {
  country_name: string;
  indicator_code: string;
  country_code?: string; // optional ISO3 code when available
  object: {
    [key: string]: string | number;
  };
}

interface CountryFeature extends Feature {
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: Geometry;
}

function Home() {
  const dispatch = useDispatch();
  const indicatorCode = useSelector((state: IStateSiteInfo) => state.siteInfo);

  const [indicators, setIndicators] = useState<ICountryData[][] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const geoJsonRef = useRef<L.GeoJSON<any> | null>(null);

  // console.log(indicators, "indicators");

  const data: any = countriesData;
  const { features } = data;

  const worldBounds: L.LatLngBoundsLiteral = [
    [-90, -180],
    [90, 180],
  ];

  const [panCountryName, setPanCountryName] = useState<string | null>(null);

  const allCountry: any = features.map((country: any) => {
    return {
      name: country.properties.name,
      isoCode: country.properties.iso_a2,
    };
  });

  const findAllInfo = useCallback(async () => {
    const codes = indicatorCode.selectedIndicator || [];

    setIsLoading(true);

    // Read cached rows from IndexedDB in parallel
    const cachedMap = await idbGetManyIndicators(codes);
    const cachedCodes: string[] = [];
    const cachedLists: ICountryData[][] = [];
    codes.forEach((code) => {
      const rows = cachedMap.get(code) as ICountryData[] | undefined;
      if (rows && rows.length) {
        cachedCodes.push(code);
        cachedLists.push(rows);
      }
    });

    // Determine which codes are missing from cache
    const missingCodes = codes.filter((c) => !cachedCodes.includes(c));

    if (missingCodes.length === 0) {
      setIndicators(cachedLists);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    ActionGetManyInfo(missingCodes)
      .then(async (res) => {
        const all = (res.data || []) as ICountryData[];
        const byCode = new Map<string, ICountryData[]>();
        all.forEach((row) => {
          const arr = byCode.get(row.indicator_code) || [];
          arr.push(row);
          byCode.set(row.indicator_code, arr);
        });

        const freshLists = missingCodes
          .map((code) => byCode.get(code) || [])
          .filter((arr) => arr.length);

        // Persist fresh lists to IndexedDB
        await Promise.all(
          missingCodes.map(async (code) => {
            const rows = byCode.get(code) || [];
            if (rows.length) {
              await idbSetIndicatorRows(code, rows);
            }
          }),
        );

        setIndicators([...cachedLists, ...freshLists]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [indicatorCode.selectedIndicator]);

  const debounceTimerRef: any = useRef(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      findAllInfo();
    }, 500);
  }, [indicatorCode.selectedIndicator, indicatorCode.selectedScoreYear]);

  const getCountryColor = useCallback(
    (countryName: string, countryIso: string) => {
      if (indicators) {
        return PrintColor(countryName, countryIso);
      }
      return "#0000";
    },
    [indicators],
  );

  const getCountryScore = (countryName: string, countryIso: string) => {
    if (!indicators) {
      return "0";
    }

    let activeCount = 0;
    const yearKey = `${indicatorCode.selectedScoreYear}_score`;

    indicators.forEach((indicatorList) => {
      const entry = indicatorList.find(
        (c) =>
          (c as any).country_code === countryIso ||
          c.country_name === countryName,
      );
      const val = entry?.object?.[yearKey];
      const hasValue = val !== undefined && val !== null && val !== "";

      if (hasValue) {
        activeCount += 1;
      }
    });

    const ratio = `${activeCount} / ${indicatorCode.selectedIndicator.length}`;

    return ratio;
  };

  const avgScoreByCountryKey = useMemo(() => {
    if (!indicators) {
      return new Map<string, number>();
    }
    const map = new Map<string, number>();
    const counts = new Map<string, number>();
    indicators.forEach((indicatorList) => {
      indicatorList.forEach((country) => {
        const score =
          country.object?.[`${indicatorCode.selectedScoreYear}_score`];
        if (score !== undefined && score !== "" && score !== null) {
          const key = (country as any).country_code || country.country_name;
          map.set(key, (map.get(key) || 0) + +score);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      });
    });
    counts.forEach((len, key) => {
      const sum = map.get(key) || 0;
      map.set(key, len ? sum / len : 0);
    });
    return map;
  }, [indicators, indicatorCode.selectedScoreYear]);

  function PrintColor(countryName: string, countryIso: string) {
    const avg =
      avgScoreByCountryKey.get(countryIso) ||
      avgScoreByCountryKey.get(countryName) ||
      0;

    const countryScore = getCountryScore(countryName, countryIso).split("/");

    return scoreToColor(avg, +countryScore[0], +countryScore[1]);
  }

  const countryStyle = (feature: CountryFeature) => {
    const isSelected =
      selectedCountries.includes(feature.properties.name) ||
      (hoverCountryName &&
        hoverCountryName.toLowerCase() ===
          feature.properties.name.toLowerCase());

    const isHovered =
      selectedCountryCodeHover &&
      (feature as any).properties?.iso_a3_eh === selectedCountryCodeHover;

    return {
      fillColor: getCountryColor(
        feature.properties.name,
        feature.properties.iso_a3_eh,
      ),

      color: isHovered || isSelected ? "black" : "black",
      weight: isHovered || isSelected ? 4 : 1,

      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const [selectedCountryCodeHover, setSelectedCountryCodeHover] =
    useState<string>("");
  // const [showScoreLabels, setShowScoreLabels] = useState<boolean>(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [hoverCountryName, setHoverCountryName] = useState<string | null>(null);

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      const countryIco = country.properties.iso_a3_eh;

      layer.on({
        mouseover: () => {
          setSelectedCountryCodeHover(countryIco);
          setHoverCountryName(countryName);
        },
        mouseout: () => {
          setSelectedCountryCodeHover("");
          setHoverCountryName(null);
        },
        click: () => {
          dispatch(setSelectCountryIso(countryIco));
          setSelectedCountries((prev) => {
            if (prev.includes(countryName)) {
              return prev.filter((n) => n !== countryName);
            }
            if (prev.length < 2) {
              return [...prev, countryName];
            }
            return [prev[1], countryName];
          });
        },
      });
    },
    [indicators, indicatorCode.selectedScoreYear],
  );

  function computeCountryStats(countryIso3: string) {
    if (!indicators) {
      return {
        activeIndicator: `0 / ${indicatorCode.selectedIndicator.length}`,
        activeScore: "0",
        maxScore: undefined as
          | {
              Indicator_name: string;
              rank?: number;
              rankCount?: number;
              score?: number;
            }
          | undefined,
      };
    }
    let activeCount = 0;
    let sumScores = 0;
    let bestIndicatorEntry: any = null;
    let bestIndicatorScore: number | null = null;
    const yearKey = `${indicatorCode.selectedScoreYear}_score`;

    indicators.forEach((indicatorList) => {
      const entry = indicatorList.find(
        (c) => (c as any).country_code === countryIso3,
      );

      const val = entry?.object?.[yearKey];

      const hasValue = val !== undefined && val !== null && val !== "";
      if (hasValue) {
        const numericVal = +val;
        activeCount += 1;
        sumScores += numericVal;
        if (
          bestIndicatorScore === null ||
          numericVal > (bestIndicatorScore as number)
        ) {
          bestIndicatorEntry = entry;
          bestIndicatorScore = numericVal;
        }
      }
    });

    const avg = activeCount
      ? formatLargeNumber(Number((sumScores / activeCount).toFixed(0)))
      : "0";
    const maxScore = bestIndicatorEntry
      ? {
          Indicator_name: bestIndicatorEntry.Indicator_name,
          score:
            bestIndicatorScore !== null
              ? Number((bestIndicatorScore as number).toFixed(0))
              : undefined,
        }
      : undefined;

    return {
      activeIndicator: `${activeCount} / ${indicatorCode.selectedIndicator.length}`,
      activeScore: avg,
      maxScore,
    };
  }

  const populationByCode = useMemo(() => {
    const map: Record<string, any> = {};
    (people_info as any[]).forEach((row: any) => {
      if (row["Indicator Name"] === "Population, total") {
        map[row["Country Code"]] = row;
      }
    });
    return map;
  }, []);

  const areaByCode = useMemo(() => {
    const map: Record<string, any> = {};
    (people_info as any[]).forEach((row: any) => {
      if (row["Indicator Name"] === "Surface area (sq. km)") {
        map[row["Country Code"]] = row;
      }
    });
    return map;
  }, []);

  // Function to calculate country center coordinates
  const getCountryCenter = (feature: any): [number, number] => {
    const layer = (L as any).geoJSON(feature);
    const bounds = layer.getBounds();
    if (bounds && bounds.isValid()) {
      const center = bounds.getCenter();
      return [center.lat, center.lng];
    }
    return [0, 0]; // fallback
  };

  // Create custom marker icon
  const createCustomIcon = (count: string) => {
    return L.divIcon({
      html: `<div style="
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #615fff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 9px;
        color: #1e40af;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        text-align: center;
        line-height: 1;
      ">${count}</div>`,
      className: "custom-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const PanToCountry: React.FC<{ countryName: string | null }> = ({
    countryName,
  }) => {
    const map = useMap();
    useEffect(() => {
      if (!countryName) {
        return;
      }
      try {
        const feature = (countriesData as any).features.find(
          (f: any) => f.properties?.name === countryName,
        );
        if (!feature) {
          return;
        }
        const layer = (L as any).geoJSON(feature);
        const bounds = layer.getBounds();
        if (bounds && bounds.isValid()) {
          (map as any).fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 5,
            animate: true,
          });
        } else {
          const center = layer.getBounds().getCenter();
          (map as any).setView(center, 4, { animate: true });
        }
      } finally {
        setPanCountryName(null);
      }
    }, [countryName]);
    return null;
  };

  return (
    <MainTemplate>
      {indicators && (
        <div className="w-full h-full relative overflow-hidden dark:bg-gray-900">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={3}
            className="w-full h-full"
            worldCopyJump={true}
            maxBounds={worldBounds}
            minZoom={2}
            maxZoom={5}
            maxBoundsViscosity={1.0}
          >
            <PanToCountry countryName={panCountryName} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              noWrap={true}
            />

            <GeoJSON
              key={`map-geojson`}
              data={features as any}
              style={countryStyle}
              onEachFeature={onEachCountry as any}
              ref={geoJsonRef as any}
            />

            {/* Display indicator counts on each country */}
            {features.map((feature: any, index: number) => {
              const countryName = feature.properties.name;
              const countryIso = feature.properties.iso_a3_eh;
              const center = getCountryCenter(feature);
              const indicatorCount = getCountryScore(countryName, countryIso);

              // Only show marker if there are indicators selected
              if (indicatorCode.selectedIndicator.length === 0) {
                return null;
              }

              return (
                <Marker
                  key={`marker-${index}`}
                  position={center}
                  icon={createCustomIcon(indicatorCount)}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{countryName}</strong>
                      <br />
                      <span className="text-sm text-gray-600">
                        Indicators with data: {indicatorCount}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          <SelectCountry
            allCountry={allCountry}
            onSelectCountry={(name) => setPanCountryName(name)}
          />

          {isLoading && (
            <div className="absolute top-[110px] left-4 z-[1000]">
              <Spinner color="secondary" className="dark:text-white" />
            </div>
          )}

          <div className="w-[calc(100%-30px)] md:w-[420px] dark:text-white absolute top-[80px] md:top-4 right-4 z-[1000] rounded-xl cursor-default transition-colors duration-500">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl dark:shadow-2xl">
              <h4 className="text-[14px] sm:text-[16px] font-bold mb-1 sm:mb-3 text-gray-900 dark:text-white">
                Selected countries
              </h4>
              <div className="flex md:flex-col gap-3">
                {[0, 1].map((idx) => {
                  const name = selectedCountries[idx];
                  // find ISO3 for area/pop and stats
                  const feature: any = (countriesData as any).features.find(
                    (f: any) => f.properties?.name === name,
                  );
                  const iso3 = feature?.properties?.iso_a3_eh;
                  const stats = iso3 ? computeCountryStats(iso3) : null;
                  return (
                    <div
                      key={`sel-${idx}`}
                      className="rounded-lg bg-gray-50 dark:bg-gray-700 w-full"
                    >
                      <div className="flex-jsb-c gap-2 px-3 py-2">
                        <span className="sm:text-[14px] text-[12px]">
                          {name || "-"}
                        </span>
                        {name ? (
                          <i
                            className="fa-solid fa-xmark w-6 h-6 rounded-full flex justify-center items-center cursor-pointer bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow hover:shadow-md"
                            onClick={() =>
                              setSelectedCountries((prev) =>
                                prev.filter((n) => n !== name),
                              )
                            }
                          />
                        ) : null}
                      </div>
                      {name && (
                        <ul className="px-3 pb-3 text-gray-700 dark:text-gray-300">
                          <li className="text-[12px] sm:text-[14px]">
                            <b>Area:</b>{" "}
                            {formatLargeNumber(
                              (areaByCode as any)[iso3]?.[
                                indicatorCode.selectedScoreYear
                              ] || 0,
                            )}{" "}
                            sq km
                          </li>
                          <li className="text-[12px] sm:text-[14px]">
                            <b>Population:</b>{" "}
                            {formatLargeNumber(
                              (populationByCode as any)[iso3]?.[
                                indicatorCode.selectedScoreYear
                              ] || 0,
                            )}
                          </li>
                          <li className="text-[12px] sm:text-[14px]">
                            <b>Number of indicators with data:</b>{" "}
                            {stats?.activeIndicator}
                          </li>
                          <li className="text-[12px] sm:text-[14px]">
                            <b>Average score:</b>{" "}
                            {stats?.activeScore === "NaN"
                              ? "-"
                              : stats?.activeScore}
                          </li>
                          <li className="text-[12px] sm:text-[14px] flex-js-s gap-2">
                            <b>Best:</b>{" "}
                            {stats?.maxScore?.Indicator_name
                              ? `${stats?.maxScore.score ?? "-"} - ${stats?.maxScore.Indicator_name}`
                              : "-"}
                          </li>
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {hoverCountryName && (
              <ul className="mt-3 rounded-[12px] p-4 bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl text-gray-700 dark:text-gray-300 md:block hidden">
                <li className="text-[12px] sm:text-[14px]">
                  <b>Hover Country:</b> {hoverCountryName || "-"}
                </li>
                <li className="text-[12px] sm:text-[14px]">
                  <b>Selected Year:</b> {indicatorCode.selectedScoreYear}
                </li>
                {hoverCountryName &&
                  (() => {
                    const feature: any = (countriesData as any).features.find(
                      (f: any) => f.properties?.name === hoverCountryName,
                    );
                    const iso3 = feature?.properties?.iso_a3_eh;
                    const stats = iso3 ? computeCountryStats(iso3) : null;
                    return (
                      <>
                        <li className="text-[12px] sm:text-[14px]">
                          <b>Area:</b>{" "}
                          {formatLargeNumber(
                            (areaByCode as any)[iso3]?.[
                              indicatorCode.selectedScoreYear
                            ] || 0,
                          )}{" "}
                          sq km
                        </li>
                        <li className="text-[12px] sm:text-[14px]">
                          <b>Population:</b>{" "}
                          {formatLargeNumber(
                            (populationByCode as any)[iso3]?.[
                              indicatorCode.selectedScoreYear
                            ] || 0,
                          )}
                        </li>
                        <li className="text-[12px] sm:text-[14px]">
                          <b>Number of indicators with data:</b>{" "}
                          {stats?.activeIndicator}
                        </li>
                        <li className="text-[12px] sm:text-[14px]">
                          <b>Average score:</b>{" "}
                          {stats?.activeScore === "NaN"
                            ? "-"
                            : stats?.activeScore}
                        </li>
                        <li className="text-[12px] sm:text-[14px] flex-js-s gap-2">
                          <b>Best:</b>{" "}
                          {stats?.maxScore?.Indicator_name
                            ? `${stats?.maxScore.score ?? "-"} - ${stats?.maxScore.Indicator_name}`
                            : "-"}
                        </li>
                      </>
                    );
                  })()}
              </ul>
            )}
          </div>
          <RightInfo />
        </div>
      )}
    </MainTemplate>
  );
}

export default Home;
