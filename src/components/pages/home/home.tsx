import { GeoJSON, MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
import { setSelectCountry, setSelectCountryIso } from "@/redux/info";
import { ActionGetManyInfo } from "@/app/actions/industry/get-many";
import MainTemplate from "@/components/common/main-template/main-template";

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

// Format numbers with comma separators
const formatNumber = (num: string | number) => {
  const numValue = typeof num === "string" ? parseInt(num) : num;
  return isNaN(numValue) ? "" : numValue.toLocaleString("en-US");
};

function Home() {
  const dispatch = useDispatch();
  const indicatorCode = useSelector((state: IStateSiteInfo) => state.siteInfo);

  const [indicators, setIndicators] = useState<ICountryData[][] | null>(null);
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
    FindAllInfo();
  }, [indicatorCode]);

  async function FindAllInfo() {
    const codes = indicatorCode.selectedIndicator;

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
  }

  const getCountryColor = useCallback(
    (countryName: string) => {
      if (indicators) {
        return PrintColor(countryName);
      }
      return "#0000";
    },
    [indicators],
  );

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

  function PrintColor(countryName: string) {
    const avg = avgScoreByCountryName.get(countryName) || 0;
    return scoreToColor(avg);
  }

  const countryStyle = (feature: CountryFeature) => {
    const isSelected =
      indicatorCode.selectedCountry &&
      indicatorCode.selectedCountry.toLowerCase() ===
        feature.properties.name.toLowerCase();
    const isHovered =
      selectedCountryCodeHover &&
      (feature as any).properties?.iso_a3_eh === selectedCountryCodeHover;

    return {
      fillColor: getCountryColor(feature.properties.name),

      color: isHovered ? "black" : isSelected ? "black" : "black",
      weight: isHovered ? 3 : isSelected ? 3 : 1,

      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const [selectedCountryHover, setSelectedCountryHover] = useState<string>("");
  const [selectedCountryCodeHover, setSelectedCountryCodeHover] =
    useState<string>("");
  const [showScoreLabels, setShowScoreLabels] = useState<boolean>(true);

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      const countryIco = country.properties.iso_a3_eh;

      // Calculate score for this country
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

      const countryScore = getCountryScore(countryName, countryIco);
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">${countryName}</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #666;">
            <strong>Indicators:</strong> ${countryScore}
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #888;">
            Year: ${indicatorCode.selectedScoreYear}
          </p>
        </div>
      `;

      layer.bindPopup(popupContent);

      layer.on({
        mouseover: () => {
          setSelectedCountryCodeHover(countryIco);
          setSelectedCountryHover(countryName);
        },
        mouseout: () => {
          setSelectedCountryCodeHover("");
          setSelectedCountryHover("");
        },

        click: () => {
          dispatch(setSelectCountryIso(countryIco));

          if (indicatorCode.selectedCountry) {
            if (indicatorCode.selectedCountry === countryName) {
              dispatch(setSelectCountry(null));
            } else {
              dispatch(setSelectCountry(countryName));
            }
          } else {
            dispatch(setSelectCountry(countryName));
          }
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

  function CalcActiveIndicator() {
    // Count how many selected indicators have a value for the selected country
    let activeCount = 0;
    let sumScores = 0;

    // Determine the "best" indicator for the selected country and compute its rank among countries with values
    let bestIndicatorEntry: any = null; // ICountryData for selected country
    let bestIndicatorRank = 0;
    let bestIndicatorCount = 0;

    const yearKey = `${indicatorCode.selectedScoreYear}_score`;
    const countryIso = indicatorCode.selectedCountryIso;

    if (indicators && countryIso) {
      indicators.forEach((indicatorList) => {
        // Find this country in the indicator list
        const entry = indicatorList.find(
          (c) =>
            (c as any).country_code === countryIso ||
            c.country_name === indicatorCode.selectedCountry,
        );
        const val = entry?.object?.[yearKey];
        const hasValue = val !== undefined && val !== null && val !== "";

        if (hasValue) {
          activeCount += 1;
          sumScores += +val;

          // Build valid list and rank
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
            const idx = valid.findIndex(
              (r) =>
                (r as any).country_code === countryIso ||
                r.country_name === indicatorCode.selectedCountry,
            );
            const rank = idx >= 0 ? idx + 1 : null;

            // Choose best by rank when comparable, otherwise by score
            const better = () => {
              if (!bestIndicatorEntry) {
                return true;
              }
              if (rank !== null && bestIndicatorRank !== null) {
                return rank < bestIndicatorRank; // lower rank is better
              }
              const bestVal = +bestIndicatorEntry.object[yearKey];
              return +val > bestVal; // fallback by score
            };

            if (rank !== null && better()) {
              bestIndicatorEntry = entry;
              bestIndicatorRank = rank;
              bestIndicatorCount = valid.length;
            }
          }
        }
      });
    }

    const avg = activeCount
      ? formatNumber((sumScores / activeCount).toFixed(0))
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

  const selectedIsoCode = indicatorCode.selectedCountryIso || "";

  const Population: any = useMemo(
    () => populationByCode[selectedIsoCode] || {},
    [populationByCode, selectedIsoCode],
  );

  const area: any = useMemo(
    () => areaByCode[selectedIsoCode] || {},
    [areaByCode, selectedIsoCode],
  );

  const getCalcScore = CalcActiveIndicator();

  // Create score labels for all countries
  const countryScoreLabels = useMemo(() => {
    if (!indicators || !features) {
      return [];
    }

    const labels: any[] = [];
    const yearKey = `${indicatorCode.selectedScoreYear}_score`;

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
        // Get country center coordinates
        const coordinates = country.geometry.coordinates;
        let centerLat = 0;
        let centerLng = 0;

        if (country.geometry.type === "Polygon") {
          // Calculate center of polygon
          const coords = coordinates[0];
          let sumLat = 0;
          let sumLng = 0;
          coords.forEach((coord: number[]) => {
            sumLng += coord[0];
            sumLat += coord[1];
          });
          centerLng = sumLng / coords.length;
          centerLat = sumLat / coords.length;
        } else if (country.geometry.type === "MultiPolygon") {
          // Calculate center of first polygon
          const coords = coordinates[0][0];
          let sumLat = 0;
          let sumLng = 0;
          coords.forEach((coord: number[]) => {
            sumLng += coord[0];
            sumLat += coord[1];
          });
          centerLng = sumLng / coords.length;
          centerLat = sumLat / coords.length;
        }

        // Create custom icon for score label
        const scoreIcon = L.divIcon({
          html: `
            <div style="
              background: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              text-align: center;
              border: 1px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            ">
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
          score: `${activeCount} / ${indicatorCode.selectedIndicator.length}`,
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

  // removed debug logs

  const hoverStats = useMemo(() => {
    if (!indicators || !selectedCountryHover) {
      return {
        activeIndicator: `0 / ${indicatorCode.selectedIndicator.length}`,
        activeScore: "0",
      };
    }
    let sumScores = 0;
    let countActive = 0;
    indicators.forEach((indicatorList) => {
      const found = indicatorList.find((c) =>
        c.country_name.includes(selectedCountryHover),
      );
      const score = found?.object?.[`${indicatorCode.selectedScoreYear}_score`];
      if (score !== undefined && score !== "" && score !== null) {
        sumScores += +score;
        countActive += 1;
      }
    });
    const avg = countActive
      ? formatNumber((sumScores / countActive).toFixed(0))
      : "0";
    return {
      activeIndicator: `${countActive} / ${indicatorCode.selectedIndicator.length}`,
      activeScore: avg,
    };
  }, [
    indicators,
    selectedCountryHover,
    indicatorCode.selectedIndicator.length,
    indicatorCode.selectedScoreYear,
  ]);

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
            maxBoundsViscosity={1.0}
          >
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

            {/* Score labels for all countries */}
            {showScoreLabels &&
              countryScoreLabels.map((label, index) => (
                <Marker
                  key={`score-label-${index}`}
                  position={label.position}
                  icon={label.icon}
                >
                  <Popup>
                    <div>
                      <strong>{label.countryName}</strong>
                      <br />
                      Average Score: {label.score}
                      <br />
                      Year: {indicatorCode.selectedScoreYear}
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
          <SelectCountry allCountry={allCountry} />

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

          {indicatorCode.selectedCountry ? (
            <div className="w-[400px] dark:text-white absolute top-4 right-4 z-[100000] rounded-xl cursor-default transition-colors duration-500">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl dark:shadow-2xl">
                <i
                  className="fa-solid fa-xmark absolute top-[-10px] right-[-10px] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer
               bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-xl hover:shadow-2xl transition-all"
                  onClick={() => dispatch(setSelectCountry(null))}
                />
                <h4 className="font-bold mb-2 text-gray-900 dark:text-white">
                  {indicatorCode.selectedCountry}
                </h4>

                <ul className="text-gray-700 dark:text-gray-300">
                  <li className="text-[14px]">
                    <b>Area:</b>{" "}
                    {formatLargeNumber(area[indicatorCode.selectedScoreYear])}{" "}
                    sq km
                  </li>
                  <li className="text-[14px]">
                    <b>Population:</b>{" "}
                    {formatLargeNumber(
                      Population[indicatorCode.selectedScoreYear],
                    )}
                  </li>
                  <li className="text-[14px]">
                    <b>Number of indicators with data:</b>{" "}
                    {getCalcScore.activeIndicator}
                  </li>
                  <li className="text-[14px]">
                    <b>Average score:</b>{" "}
                    {getCalcScore.activeScore === "NaN"
                      ? "-"
                      : getCalcScore.activeScore}
                  </li>
                  <li className="text-[14px] flex-js-s gap-2">
                    <b>Best:</b>{" "}
                    {getCalcScore.maxScore?.Indicator_name
                      ? `${getCalcScore.maxScore.rank || "-"} ${getCalcScore.maxScore.Indicator_name}`
                      : "-"}
                  </li>
                </ul>
              </div>

              {selectedCountryCodeHover && (
                <ul className="mt-2 rounded-[12px] p-4 bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl text-gray-700 dark:text-gray-300">
                  <li className="text-[14px]">
                    <b>Hover Country:</b> {selectedCountryHover}
                  </li>
                  <li className="text-[14px]">
                    <b>Selected Year:</b> {indicatorCode.selectedScoreYear}
                  </li>
                  <li className="text-[14px]">
                    <b>Area:</b>{" "}
                    {formatLargeNumber(
                      (areaByCode[selectedCountryCodeHover] || {})[
                        indicatorCode.selectedScoreYear
                      ] || 0,
                    )}{" "}
                    sq km
                  </li>
                  <li className="text-[14px]">
                    <b>Population:</b>{" "}
                    {formatLargeNumber(
                      (populationByCode[selectedCountryCodeHover] || {})[
                        indicatorCode.selectedScoreYear
                      ] || 0,
                    )}
                  </li>
                  <li className="text-[14px]">
                    <b>Number of indicators with data:</b>{" "}
                    {hoverStats.activeIndicator}
                  </li>
                  <li className="text-[14px]">
                    <b>Average score:</b>{" "}
                    {hoverStats.activeScore === "NaN"
                      ? "-"
                      : hoverStats.activeScore}
                  </li>
                </ul>
              )}
            </div>
          ) : null}
          <RightInfo />
        </div>
      )}
    </MainTemplate>
  );
}

export default Home;
