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

  const onEachCountry = useCallback(
    (country: CountryFeature, layer: L.Layer) => {
      const countryName = country.properties.name;
      layer.bindPopup(countryName);

      layer.on({
        click: () => {
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

  const findSelectedInfo: any = people_info.find(
    (country) => country["Country Code"] == indicatorCode.selectedCountry,
  );

  console.log(findSelectedInfo);

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
            <div className="px-6 py-4 bg-white dark:bg-gray-700 dark:text-white absolute top-4 right-4 z-[1000] rounded-lg cursor-default">
              {indicatorCode.selectedCountry}
              <i
                className="fa-solid fa-xmark absolute top-[-10px] right-[-10px] bg-white dark:bg-gray-800 dark:text-gray-200 w-8 h-8 rounded-full flex-jc-c cursor-pointer"
                onClick={() => dispatch(setSelectCountry(null))}
              />

              {/*{findSelectedInfo[indicatorCode.selectedScoreYear]}*/}
            </div>
          ) : null}

          <RightInfo />
        </div>
      )}
    </div>
  );
}

export default Home;
