import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import people_info from "@/access/people_info.json";
import RightInfo from "@/components/pages/home/right-info";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatLargeNumber, scoreToColor } from "@/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import SelectCountry from "@/components/pages/home/select-country";
import { setSelectCountryIso } from "@/redux/info";
import { ActionGetManyInfo } from "@/app/actions/industry/get-many";
import MainTemplate from "@/components/common/main-template/main-template";
import { Spinner } from "@heroui/react";

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

// number formatting handled by helpers.formatLargeNumber where needed

function Home() {
  const dispatch = useDispatch();
  const indicatorCode = useSelector((state: IStateSiteInfo) => state.siteInfo);

  const [indicators, setIndicators] = useState<ICountryData[][] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const geoJsonRef = useRef<L.GeoJSON<any> | null>(null);

  console.log(isLoading);

  const data: any = countriesData;
  const { features } = data;

  const worldBounds: L.LatLngBoundsLiteral = [
    [-90, -180],
    [90, 180],
  ];

  const allCountry: any = features.map((country: any) => {
    return {
      name: country.properties.name,
      isoCode: country.properties.iso_a2,
    };
  });

  useEffect(() => {
    setIsLoading(true);
    FindAllInfo();
  }, [indicatorCode.selectedIndicator, indicatorCode.selectedScoreYear]);

  async function FindAllInfo() {
    const codes = indicatorCode.selectedIndicator;
    try {
      setMapLoaded(false); // Reset map loading state when fetching new data
      const res = await ActionGetManyInfo(codes);
      const all = (res.data || []) as ICountryData[];
      // Group by indicator_code for compatibility with existing logic
      const byCode = new Map<string, ICountryData[]>();
      all.forEach((row) => {
        const arr = byCode.get(row.indicator_code) || [];
        arr.push(row);
        byCode.set(row.indicator_code, arr);
      });
      setIndicators(Array.from(byCode.values()));
    } catch (error) {
      // Set empty indicators on error to prevent infinite loading
      setIndicators([]);
    } finally {
      setIsLoading(false);
    }
  }

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

  const avgScoreByCountryName = useMemo(() => {
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
          const key = country.country_name;
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
    const avg = avgScoreByCountryName.get(countryName) || 0;

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
      weight: isHovered || isSelected ? 3 : 1,

      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const [selectedCountryHover, setSelectedCountryHover] = useState<string>("");
  const [selectedCountryCodeHover, setSelectedCountryCodeHover] =
    useState<string>("");
  const [showScoreLabels, setShowScoreLabels] = useState<boolean>(true);
  const [panCountryName, setPanCountryName] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [hoverCountryName, setHoverCountryName] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

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
        // clear after panning to avoid repeated fits
        setPanCountryName(null);
      }
    }, [countryName]);
    return null;
  };

  // Component to handle map loading state
  const MapLoadingHandler: React.FC = () => {
    const map = useMap();
    useEffect(() => {
      const handleMapLoad = () => {
        setMapLoaded(true);
      };

      // Listen for map load events
      map.on("load", handleMapLoad);
      map.on("tileload", handleMapLoad);

      // Also set loaded if map is already ready
      if (map.getContainer()) {
        setMapLoaded(true);
      }

      return () => {
        map.off("load", handleMapLoad);
        map.off("tileload", handleMapLoad);
      };
    }, [map]);

    return null;
  };

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      const countryIco = country.properties.iso_a3_eh;

      layer.on({
        mouseover: () => {
          setSelectedCountryCodeHover(countryIco);
          setSelectedCountryHover(countryName);
          setHoverCountryName(countryName);
        },
        mouseout: () => {
          setSelectedCountryCodeHover("");
          setSelectedCountryHover("");
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

  // Re-apply styles on hover state changes to avoid flicker/overrides
  useEffect(() => {
    if (geoJsonRef.current) {
      try {
        (geoJsonRef.current as any).setStyle(countryStyle as any);
      } catch {
        // setStyle error - ignore
      }
    }
  }, [
    selectedCountryHover,
    selectedCountryCodeHover,
    indicatorCode.selectedCountry,
  ]);

  // Build quick-lookup maps for area and population by ISO3 code
  const populationByCode = useMemo(() => {
    const by: Record<string, any> = {};
    (people_info as any[]).forEach((row: any) => {
      if (row["Indicator Name"] === "Population, total") {
        by[row["Country Code"]] = row;
      }
    });
    return by;
  }, []);

  const areaByCode = useMemo(() => {
    const by: Record<string, any> = {};
    (people_info as any[]).forEach((row: any) => {
      if (row["Indicator Name"] === "Surface area (sq. km)") {
        by[row["Country Code"]] = row;
      }
    });
    return by;
  }, []);

  function computeCountryStats(countryName: string) {
    if (!indicators) {
      return {
        activeIndicator: `0 / ${indicatorCode.selectedIndicator.length}`,
        activeScore: "0",
        maxScore: undefined as
          | { Indicator_name: string; rank?: number; rankCount?: number }
          | undefined,
      };
    }
    let activeCount = 0;
    let sumScores = 0;
    let bestIndicatorEntry: any = null;
    let bestIndicatorRank: number | null = null;
    let bestIndicatorCount = 0;
    const yearKey = `${indicatorCode.selectedScoreYear}_score`;

    indicators.forEach((indicatorList) => {
      const entry = indicatorList.find((c) => c.country_name === countryName);
      const val = entry?.object?.[yearKey];
      const hasValue = val !== undefined && val !== null && val !== "";
      if (hasValue) {
        activeCount += 1;
        sumScores += +val;

        const valid = indicatorList.filter((row) => {
          const v = row.object?.[yearKey];
          return v !== undefined && v !== null && v !== "";
        });
        if (valid.length) {
          const isDescending =
            (valid[0]?.object?.descending || "TRUE") === "TRUE";
          valid.sort((a, b) => {
            const av = +a.object[yearKey];
            const bv = +b.object[yearKey];
            return isDescending ? bv - av : av - bv;
          });
          const idx = valid.findIndex((r) => r.country_name === countryName);
          const rank = idx >= 0 ? idx + 1 : null;
          const better = () => {
            if (!bestIndicatorEntry) {
              return true;
            }
            if (rank !== null && bestIndicatorRank !== null) {
              return rank < bestIndicatorRank;
            }
            const bestVal = +bestIndicatorEntry.object[yearKey];
            return +val > bestVal;
          };
          if (rank !== null && better()) {
            bestIndicatorEntry = entry;
            bestIndicatorRank = rank;
            bestIndicatorCount = valid.length;
          }
        }
      }
    });

    const avg = activeCount
      ? formatLargeNumber(Number((sumScores / activeCount).toFixed(0)))
      : "0";
    const maxScore = bestIndicatorEntry
      ? {
          Indicator_name: bestIndicatorEntry.Indicator_name,
          rank: bestIndicatorRank || undefined,
          rankCount: bestIndicatorCount || undefined,
        }
      : undefined;

    return {
      activeIndicator: `${activeCount} / ${indicatorCode.selectedIndicator.length}`,
      activeScore: avg,
      maxScore,
    };
  }

  // const populationByCode = useMemo(() => {
  //   const map: Record<string, any> = {};
  //   (people_info as any[]).forEach((row: any) => {
  //     if (row["Indicator Name"] === "Population, total") {
  //       map[row["Country Code"]] = row;
  //     }
  //   });
  //   return map;
  // }, []);

  // const areaByCode = useMemo(() => {
  //   const map: Record<string, any> = {};
  //   (people_info as any[]).forEach((row: any) => {
  //     if (row["Indicator Name"] === "Surface area (sq. km)") {
  //       map[row["Country Code"]] = row;
  //     }
  //   });
  //   return map;
  // }, []);

  // keep utilities for potential future use in country detail panels

  // Create score labels for all countries (commented out for performance)
  // const countryScoreLabels = useMemo(() => {
  //   if (!indicators || !features) {
  //     return [];
  //   }
  //   // ... implementation
  // }, [indicators, indicatorCode.selectedScoreYear, indicatorCode.selectedIndicator.length, features]);

  // Collision controller: keep only one label per small pixel grid cell at current zoom (commented out for performance)
  // const CollisionController: React.FC<{
  //   labels: any[];
  //   onFiltered: (labels: any[]) => void;
  // }> = ({ labels, onFiltered }) => {
  //   // ... implementation
  // };

  // removed debug logs

  // const hoverStats = useMemo(() => {
  //   if (!indicators || !selectedCountryHover) {
  //     return {
  //       activeIndicator: `0 / ${indicatorCode.selectedIndicator.length}`,
  //       activeScore: "0",
  //     };
  //   }
  //   let sumScores = 0;
  //   let countActive = 0;
  //   indicators.forEach((indicatorList) => {
  //     const found = indicatorList.find((c) =>
  //       c.country_name.includes(selectedCountryHover),
  //     );
  //     const score = found?.object?.[`${indicatorCode.selectedScoreYear}_score`];
  //     if (score !== undefined && score !== "" && score !== null) {
  //       sumScores += +score;
  //       countActive += 1;
  //     }
  //   });
  //   const avg = countActive
  //     ? formatNumber((sumScores / countActive).toFixed(0))
  //     : "0";
  //   return {
  //     activeIndicator: `${countActive} / ${indicatorCode.selectedIndicator.length}`,
  //     activeScore: avg,
  //   };
  // }, [
  //   indicators,
  //   selectedCountryHover,
  //   indicatorCode.selectedIndicator.length,
  //   indicatorCode.selectedScoreYear,
  // ]);

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
            <MapLoadingHandler />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              noWrap={true}
            />

            <GeoJSON
              key={`map-geojson`}
              data={countriesData as any}
              style={countryStyle}
              onEachFeature={onEachCountry as any}
              ref={geoJsonRef as any}
            />

            {/* <CollisionController
              labels={countryScoreLabels}
              onFiltered={setFilteredScoreLabels}
            /> */}
          </MapContainer>
          <SelectCountry
            allCountry={allCountry}
            onSelectCountry={(name) => setPanCountryName(name)}
          />

          {/* Toggle button for score labels */}
          <div className="absolute top-[80px] left-3 z-[1000]">
            <button
              onClick={() => setShowScoreLabels(!showScoreLabels)}
              className={`
                w-[30px] flex-jc-c h-[40px] rounded-[4px] font-medium text-sm transition-all duration-200 cursor-pointer
                ${
                  showScoreLabels
                    ? "bg-white text-black shadow-lg hover:bg-gray-200"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }
              `}
            >
              {showScoreLabels ? (
                <i className="fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa-solid fa-eye"></i>
              )}
            </button>
          </div>

          {(isLoading || !mapLoaded) && (
            <div className="absolute top-[140px] left-4 z-[1000]">
              <Spinner color="secondary" className="dark:text-white" />
            </div>
          )}

          <div className="w-[calc(100%-30px)] md:w-[420px] dark:text-white absolute top-[80px] md:top-4 right-4 z-[1000] rounded-xl cursor-default transition-colors duration-500">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl dark:shadow-2xl">
              <h4 className="font-bold mb-3 text-gray-900 dark:text-white">
                Selected countries
              </h4>
              <div className="flex md:flex-col gap-3">
                {[0, 1].map((idx) => {
                  const name = selectedCountries[idx];
                  const stats = name ? computeCountryStats(name) : null;
                  // find ISO3 for area/pop
                  const feature: any = (countriesData as any).features.find(
                    (f: any) => f.properties?.name === name,
                  );
                  const iso3 = feature?.properties?.iso_a3_eh;
                  return (
                    <div
                      key={`sel-${idx}`}
                      className="rounded-lg bg-gray-50 dark:bg-gray-700 w-full"
                    >
                      <div className="flex-jsb-c gap-2 px-3 py-2">
                        <span className="text-[14px]">{name || "-"}</span>
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
                          <li className="text-[14px]">
                            <b>Area:</b>{" "}
                            {formatLargeNumber(
                              (areaByCode as any)[iso3]?.[
                                indicatorCode.selectedScoreYear
                              ] || 0,
                            )}{" "}
                            sq km
                          </li>
                          <li className="text-[14px]">
                            <b>Population:</b>{" "}
                            {formatLargeNumber(
                              (populationByCode as any)[iso3]?.[
                                indicatorCode.selectedScoreYear
                              ] || 0,
                            )}
                          </li>
                          <li className="text-[14px]">
                            <b>Number of indicators with data:</b>{" "}
                            {stats?.activeIndicator}
                          </li>
                          <li className="text-[14px]">
                            <b>Average score:</b>{" "}
                            {stats?.activeScore === "NaN"
                              ? "-"
                              : stats?.activeScore}
                          </li>
                          <li className="text-[14px] flex-js-s gap-2">
                            <b>Best:</b>{" "}
                            {stats?.maxScore?.Indicator_name
                              ? `${stats?.maxScore.rank || "-"} ${stats?.maxScore.Indicator_name}`
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
                <li className="text-[14px]">
                  <b>Hover Country:</b> {hoverCountryName || "-"}
                </li>
                <li className="text-[14px]">
                  <b>Selected Year:</b> {indicatorCode.selectedScoreYear}
                </li>
                {hoverCountryName &&
                  (() => {
                    const feature: any = (countriesData as any).features.find(
                      (f: any) => f.properties?.name === hoverCountryName,
                    );
                    const iso3 = feature?.properties?.iso_a3_eh;
                    const stats = computeCountryStats(hoverCountryName);
                    return (
                      <>
                        <li className="text-[14px]">
                          <b>Area:</b>{" "}
                          {formatLargeNumber(
                            (areaByCode as any)[iso3]?.[
                              indicatorCode.selectedScoreYear
                            ] || 0,
                          )}{" "}
                          sq km
                        </li>
                        <li className="text-[14px]">
                          <b>Population:</b>{" "}
                          {formatLargeNumber(
                            (populationByCode as any)[iso3]?.[
                              indicatorCode.selectedScoreYear
                            ] || 0,
                          )}
                        </li>
                        <li className="text-[14px]">
                          <b>Number of indicators with data:</b>{" "}
                          {stats.activeIndicator}
                        </li>
                        <li className="text-[14px]">
                          <b>Average score:</b>{" "}
                          {stats.activeScore === "NaN"
                            ? "-"
                            : stats.activeScore}
                        </li>
                        <li className="text-[14px] flex-js-s gap-2">
                          <b>Best:</b>{" "}
                          {stats.maxScore?.Indicator_name
                            ? `${stats.maxScore.rank || "-"} ${stats.maxScore.Indicator_name}`
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
