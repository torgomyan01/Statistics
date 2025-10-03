import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import people_info from "@/access/people_info.json";
import LeftMenu from "@/components/pages/home/left-menu";
import RightInfo from "@/components/pages/home/right-info";
import { useCallback, useEffect, useState } from "react";
import { scoreToColor } from "@/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import SelectCountry from "@/components/pages/home/select-country";
import { setSelectCountry } from "@/redux/info";
import { ActionGetAllInfo } from "@/app/actions/industry/get-indicatr-code";
import PrintInfoCountryDeff from "@/components/pages/home/print-info-country-deff";

declare interface IStateSiteInfo {
  siteInfo: {
    selectedIndicator: string[];
    selectedCountry: string | null;
    selectedScoreYear: number;
  };
}

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
    const findCounty = indicators?.map((item) =>
      item.find((country) => country.country_name.includes(countryName)),
    );

    let count = 0;
    let length = 0;

    findCounty?.forEach((item) => {
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

      color: isSelected ? "blue" : "darkblue",
      weight: isSelected ? 4 : 1,

      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const [selectedIsoCode, setSelectedIsoCode] = useState("");

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      const countryIco = country.properties.iso_a3_eh;

      layer.bindPopup(countryName);

      layer.on({
        // mouseover: () => {
        //   setSelectedIsoCodeTwo(countryIco);
        // },
        // mouseout: () => {
        //   setSelectedIsoCodeTwo("");
        // },
        click: () => {
          setSelectedIsoCode(countryIco);

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

  const findSelectedInfo: any = people_info
    .filter((country) => country["Country Code"] == selectedIsoCode)
    .slice(0, 2);

  return (
    <div className="flex-jsb-c">
      <LeftMenu />
      {indicators && (
        <div className="w-[calc(100vw-300px)] h-[100dvh] relative overflow-hidden dark:bg-gray-900">
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
            <div className="p-4 bg-white dark:bg-gray-800 dark:text-white absolute top-4 right-4 z-[1000] rounded-xl cursor-default w-[40vw] shadow-2xl transition-colors duration-500 border border-gray-200 dark:border-gray-700">
              <i
                className="fa-solid fa-xmark absolute top-[-10px] right-[-10px] w-8 h-8 rounded-full flex justify-center items-center cursor-pointer
               bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-xl hover:shadow-2xl transition-all"
                onClick={() => dispatch(setSelectCountry(null))}
              />

              <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden max-h-[80dvh]">
                <h3 className="text-xl font-extrabold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {indicatorCode.selectedCountry}
                </h3>

                <div className="space-y-4 flex-jsb-s gap-4 pr-2">
                  {findSelectedInfo.map((item: any, index: number) => (
                    <PrintInfoCountryDeff
                      key={`PrintInfoCountryDeff__${index}`}
                      item={item}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <RightInfo />
        </div>
      )}
    </div>
  );
}

export default Home;
