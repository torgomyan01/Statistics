import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import people_info from "@/access/people_info.json";
import RightInfo from "@/components/pages/home/right-info";
import { useCallback, useEffect, useState } from "react";
import { formatLargeNumber, scoreToColor } from "@/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import SelectCountry from "@/components/pages/home/select-country";
import { setSelectCountry, setSelectCountryIso } from "@/redux/info";
import { ActionGetAllInfo } from "@/app/actions/industry/get-indicatr-code";
import MainTemplate from "@/components/common/main-template/main-template";

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

  function PrintColor(countryName: string) {
    const findCounty: any = indicators?.map((item) =>
      item.find((country) => country.country_name.includes(countryName)),
    );

    let count = 0;
    let length = 0;

    findCounty?.forEach((item: any) => {
      const getArithmeticMean =
        item?.object[`${indicatorCode.selectedScoreYear}_score`];

      if (getArithmeticMean) {
        count += +getArithmeticMean;
        length++;
      }
    });

    return scoreToColor(count / length);
  }

  const countryStyle = (feature: CountryFeature) => {
    const isSelected =
      indicatorCode.selectedCountry &&
      indicatorCode.selectedCountry.toLowerCase() ===
        feature.properties.name.toLowerCase();

    return {
      fillColor: getCountryColor(feature.properties.name),

      color: isSelected ? "black" : "darkblue",
      weight: isSelected ? 4 : 1,

      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      const countryIco = country.properties.iso_a3_eh;

      layer.bindPopup(countryName);

      layer.on({
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
      findActiveIndicators?.map(
        (_ind) => _ind.object[`${indicatorCode.selectedScoreYear}_score`],
      ) || [];

    const findMax = Math.max(...findMaxScore);

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
      maxScore: findMax,
    };
  }

  const Population: any = people_info.find(
    (country) =>
      country["Country Code"] == indicatorCode.selectedCountryIso &&
      country["Indicator Name"] === "Population, total",
  );

  const area: any = people_info.find(
    (country) =>
      country["Country Code"] == indicatorCode.selectedCountryIso &&
      country["Indicator Name"] === "Surface area (sq. km)",
  );

  const getCalcScore = CalcActiveIndicator();

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
              key={indicatorCode.selectedCountry}
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
                <li className="text-[14px]">
                  <b>Best:</b> GDP - {getCalcScore.maxScore.toFixed()}
                </li>
              </ul>
            </div>
          ) : null}
          <RightInfo />
        </div>
      )}
    </MainTemplate>
  );
}

export default Home;
