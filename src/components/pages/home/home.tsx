import {
  GeoJSON,
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const geoJsonRef = useRef<L.GeoJSON<any> | null>(null);

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
  }, [indicatorCode]);

  async function FindAllInfo() {
    const codes = indicatorCode.selectedIndicator;
    try {
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
  const [filteredScoreLabels, setFilteredScoreLabels] = useState<any[]>([]);
  const [panCountryName, setPanCountryName] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [hoverCountryName, setHoverCountryName] = useState<string | null>(null);

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

  // Create score labels for all countries
  const countryScoreLabels = useMemo(() => {
    if (!indicators || !features) {
      return [];
    }

    const labels: any[] = [];
    const yearKey = `${indicatorCode.selectedScoreYear}_score`;

    // Removed centroid helpers in favor of Leaflet bounds center

    // ringArea remains for potential future geometric utilities

    // centroid helpers no longer used after switching to Leaflet bounds center

    features.forEach((country: any) => {
      const countryName = country.properties.name;
      const countryIso = country.properties.iso_a3_eh;

      // Calculate score for this country
      let activeCount = 0;

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

      // Only show labels for countries with data
      if (activeCount > 0) {
        // Use Leaflet bounds for robust center and to compute on-screen size later
        const countryLayer = (L as any).geoJSON(country as any);
        const bounds = countryLayer.getBounds();
        const boundsCenter = bounds.getCenter();
        const centerLat = boundsCenter.lat;
        const centerLng = boundsCenter.lng;

        // Create custom icon for score label
        const scoreIcon = L.divIcon({
          html: `
            <div style="">
              ${activeCount} / ${indicatorCode.selectedIndicator.length}
            </div>
          `,
          className: "score-label",
          iconSize: [40, 20],
          iconAnchor: [20, 10],
        });

        labels.push({
          position: [centerLat, centerLng],
          icon: scoreIcon,
          countryName,
          activeCount,
          totalSelected: indicatorCode.selectedIndicator.length,
          score: `${activeCount} / ${indicatorCode.selectedIndicator.length}`,
          // store geographic bounds (for pixel-size filtering later)
          bbox: [
            [bounds.getSouth(), bounds.getWest()],
            [bounds.getNorth(), bounds.getEast()],
          ],
        });
      }
    });

    return labels;
  }, [
    indicators,
    indicatorCode.selectedScoreYear,
    indicatorCode.selectedIndicator.length,
    features,
  ]);

  // Collision controller: keep only one label per small pixel grid cell at current zoom
  const CollisionController: React.FC<{
    labels: any[];
    onFiltered: (labels: any[]) => void;
  }> = ({ labels, onFiltered }) => {
    const map = useMapEvents({
      load: () => recompute(),
      zoomend: () => recompute(),
      moveend: () => recompute(),
      resize: () => recompute(),
    });

    const chooseBetter = (a: any, b: any) => {
      // Prefer higher activeCount, then by country name for stability
      if ((a.activeCount || 0) !== (b.activeCount || 0)) {
        return (a.activeCount || 0) > (b.activeCount || 0) ? a : b;
      }
      return (a.countryName || "") <= (b.countryName || "") ? a : b;
    };

    const recompute = () => {
      if (!map || !labels || labels.length === 0) {
        onFiltered(labels || []);
        return;
      }
      const z = (map as any).getZoom?.() ?? 3;

      // If zoomed out too far, hide labels entirely to avoid clutter and overflow
      if (z <= 2) {
        onFiltered([]);
        return;
      }

      // Scale grid size with zoom for nicer behavior
      const thresholdPx = Math.max(18, 42 - z * 2); // between ~18..42 px
      const chosen = new Map<string, any>();
      const size = (map as any).getSize?.();
      labels.forEach((label) => {
        const [lat, lng] = label.position as [number, number];
        const pt = (map as any).latLngToLayerPoint({ lat, lng });

        // Skip labels that are out of the current viewport
        if (size) {
          const outOfView =
            pt.x < 0 || pt.y < 0 || pt.x > size.x || pt.y > size.y;
          if (outOfView) {
            return;
          }
        }

        // Hide labels when on-screen bbox smaller than label icon footprint to avoid overflow
        if (label.bbox) {
          const [[south, west], [north, east]] = label.bbox as [
            [number, number],
            [number, number],
          ];
          const sw = (map as any).latLngToLayerPoint({ lat: south, lng: west });
          const ne = (map as any).latLngToLayerPoint({ lat: north, lng: east });
          const bboxWidthPx = Math.abs(ne.x - sw.x);
          const bboxHeightPx = Math.abs(sw.y - ne.y);

          // derive label size from icon or fallback
          const iconSize = (label.icon &&
            (label.icon as any).options?.iconSize) || [40, 20];
          const [iconW, iconH] = iconSize as [number, number];

          // add a little padding for safety
          const fitsHorizontally = bboxWidthPx >= iconW + 6;
          const fitsVertically = bboxHeightPx >= iconH + 6;
          if (!fitsHorizontally || !fitsVertically) {
            return;
          }

          // attach current on-screen area to prioritize larger visible countries
          (label as any).pixelArea = bboxWidthPx * bboxHeightPx;
        }

        const keyX = Math.round(pt.x / thresholdPx);
        const keyY = Math.round(pt.y / thresholdPx);
        const key = `${keyX},${keyY}`;
        const existing = chosen.get(key);
        if (!existing) {
          chosen.set(key, label);
        } else {
          // Prefer higher activeCount, then larger on-screen area, then name
          const a = existing as any;
          const b = label as any;
          if ((a.activeCount || 0) !== (b.activeCount || 0)) {
            chosen.set(
              key,
              (a.activeCount || 0) > (b.activeCount || 0) ? a : b,
            );
          } else if ((a.pixelArea || 0) !== (b.pixelArea || 0)) {
            chosen.set(key, (a.pixelArea || 0) > (b.pixelArea || 0) ? a : b);
          } else {
            chosen.set(key, chooseBetter(existing, label));
          }
        }
      });
      let result = Array.from(chosen.values());

      // Cap the number of labels depending on zoom to keep them within country areas visually
      const maxByZoom = (zoom: number) => {
        if (zoom <= 3) {
          return 60;
        }
        if (zoom <= 4) {
          return 140;
        }
        if (zoom <= 5) {
          return 260;
        }
        return 400;
      };
      // Sort by on-screen pixel area (desc) so smaller countries drop first on zoom-out
      result.sort((a: any, b: any) => (b.pixelArea || 0) - (a.pixelArea || 0));
      const maxAllowed = maxByZoom(z);
      if (result.length > maxAllowed) {
        result = result.slice(0, maxAllowed);
      }

      onFiltered(result);
    };

    useEffect(() => {
      recompute();
    }, [labels]);

    return null;
  };

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
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              noWrap={true}
            />

            <GeoJSON
              key={`${indicatorCode.selectedCountry}-${indicatorCode.selectedScoreYear}-${indicatorCode.selectedIndicator.join(",")}`}
              data={countriesData as any}
              style={countryStyle}
              onEachFeature={onEachCountry as any}
              ref={geoJsonRef as any}
            />

            <CollisionController
              labels={countryScoreLabels}
              onFiltered={setFilteredScoreLabels}
            />

            {/* Score labels for all countries */}
            {showScoreLabels &&
              filteredScoreLabels.map((label, index) => (
                <Marker
                  key={`score-label-${index}`}
                  position={label.position}
                  icon={label.icon}
                />
              ))}
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

          {isLoading && (
            <div className="absolute top-[140px] left-4 z-[100000]">
              <Spinner color="secondary" className="dark:text-white" />
            </div>
          )}

          <div className="w-[420px] dark:text-white absolute top-4 right-4 z-[100000] rounded-xl cursor-default transition-colors duration-500">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl dark:shadow-2xl">
              <h4 className="font-bold mb-3 text-gray-900 dark:text-white">
                Selected countries
              </h4>
              <div className="flex flex-col gap-3">
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
                      className="rounded-lg bg-gray-50 dark:bg-gray-700"
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

            <ul className="mt-3 rounded-[12px] p-4 bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl text-gray-700 dark:text-gray-300">
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
                        {stats.activeScore === "NaN" ? "-" : stats.activeScore}
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
          </div>
          <RightInfo />
        </div>
      )}
    </MainTemplate>
  );
}

export default Home;
