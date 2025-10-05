import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import people_info from "@/access/people_info.json";
import RightInfo from "@/components/pages/home/right-info";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatLargeNumber, scoreToColor, truncateText } from "@/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import SelectCountry from "@/components/pages/home/select-country";
import { setSelectCountry, setSelectCountryIso } from "@/redux/info";
import { ActionGetAllInfo } from "@/app/actions/industry/get-indicatr-code";
import MainTemplate from "@/components/common/main-template/main-template";
import { Tooltip } from "@heroui/react";

declare interface ICountryData {
  country_name: string;
  indicator_code: string;
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

  useEffect(FindAllInfo, [indicatorCode]);

  function FindAllInfo() {
    const allData = indicatorCode.selectedIndicator.map((item) => {
      return ActionGetAllInfo(item);
    });

    Promise.all(allData).then((res) => {
      const clearRes: any = res.map((item) => item.data);

      setIndicators(clearRes);
    });
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

    return {
      fillColor: getCountryColor(feature.properties.name),

      color: isSelected ? "black" : "darkblue",
      weight: isSelected ? 2 : 1,

      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const [selectedCountryHover, setSelectedCountryHover] = useState<string>("");
  const [selectedCountryCodeHover, setSelectedCountryCodeHover] =
    useState<string>("");

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      const countryIco = country.properties.iso_a3_eh;

      layer.bindPopup(countryName);

      layer.on({
        mouseover: () => {
          setSelectedCountryCodeHover(countryIco);
          setSelectedCountryHover(countryName);
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
    [],
  );

  function CalcActiveIndicator() {
    const _indicators = indicatorCode.allIndicators;

    const findActiveIndicators = _indicators?.filter((item) =>
      indicatorCode.selectedIndicator.some(
        (_ind) => _ind === item.indicator_code,
      ),
    );

    const findMaxScore =
      findActiveIndicators?.sort(
        (_ind, _indB) =>
          _ind.object[`${indicatorCode.selectedScoreYear}_score`] -
          _indB.object[`${indicatorCode.selectedScoreYear}_score`],
      ) || [];

    const calcOnlyActiveInd = findActiveIndicators?.filter(
      (_ind) => _ind.object[`${indicatorCode.selectedScoreYear}_score`] !== "",
    );

    const activeScore = calcOnlyActiveInd?.reduce(
      (a, b) => a + +b.object[`${indicatorCode.selectedScoreYear}_score`],
      0,
    );

    const activeScoreLength = calcOnlyActiveInd ? calcOnlyActiveInd.length : 0;
    const activeSc = activeScore ? activeScore : 0;

    return {
      activeIndicator: `${calcOnlyActiveInd?.length} / ${indicatorCode.selectedIndicator.length}`,
      activeScore: (activeSc / activeScoreLength).toFixed(0) || 0,
      maxScore: findMaxScore[0],
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
    const avg = countActive ? (sumScores / countActive).toFixed(0) : "0";
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
            />
          </MapContainer>
          <SelectCountry allCountry={allCountry} />

          {indicatorCode.selectedCountry ? (
            <div className="p-4 bg-white dark:bg-gray-800 dark:text-white absolute top-4 right-4 z-[1000] rounded-xl cursor-default shadow-2xl transition-colors duration-500 border border-gray-200 dark:border-gray-700">
              <i
                className="fa-solid fa-xmark absolute top-[-10px] right-[-10px] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer
               bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-xl hover:shadow-2xl transition-all"
                onClick={() => dispatch(setSelectCountry(null))}
              />
              <h4 className="font-bold mb-2">
                {indicatorCode.selectedCountry}
              </h4>

              <ul>
                <li className="text-[14px]">
                  <b>Selected Year:</b> {indicatorCode.selectedScoreYear}
                </li>
                <li className="text-[14px]">
                  <b>Area:</b>{" "}
                  {formatLargeNumber(area[indicatorCode.selectedScoreYear])} sq
                  km
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
                  <b>Average score:</b> {getCalcScore.activeScore}
                </li>
                <li className="text-[14px] flex-js-c gap-2">
                  <b>Best:</b>{" "}
                  <Tooltip content={getCalcScore.maxScore?.Indicator_name}>
                    {truncateText(getCalcScore.maxScore?.Indicator_name, 23)}
                  </Tooltip>
                </li>
              </ul>

              {selectedCountryCodeHover && (
                <ul className="mt-4">
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
                    <b>Average score:</b> {hoverStats.activeScore}
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
