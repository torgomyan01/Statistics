import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import LeftMenu from "@/components/pages/home/left-menu";
import RightInfo from "@/components/pages/home/right-info";
import { useCallback, useEffect, useState } from "react";
import { ActionGetAllInfo } from "@/app/actions/country/get-indicatr-code";
import { scoreToColor } from "@/utils/helpers";
import { useSelector } from "react-redux";

interface CountryFeature extends Feature {
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: Geometry;
}

function Home() {
  const indicatorCode = useSelector((state: IStateSiteInfo) => state.siteInfo);

  console.log(indicatorCode.selectedIndicator);

  const [indicators, setIndicators] = useState<ICountryData[][] | null>(null);

  useEffect(FindAllInfo, [indicatorCode]);

  function FindAllInfo() {
    const allData = indicatorCode.selectedIndicator.map((item) => {
      return ActionGetAllInfo(item);
    });

    Promise.all(allData).then((res) => {
      const clearRes = res.map((item) => item.data);

      setIndicators(clearRes);
    });
  }

  const countryStyle = (feature: CountryFeature) => {
    return {
      fillColor: getCountryColor(feature.properties.name),
      color: "darkblue",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  const getCountryColor = useCallback(
    (countryName: string) => {
      if (indicators) {
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
    },
    [indicators],
  );

  const onEachCountry = (country: CountryFeature, layer: L.Layer) => {
    const countryName = country.properties.name;
    layer.bindPopup(countryName);

    layer.on({
      // mouseover: (e: LeafletMouseEvent) => {
      //   const target = e.target as L.Path;
      //   target.setStyle({
      //     fillColor: "blue",
      //     color: "darkblue",
      //   });
      // },
      // mouseout: (e: LeafletMouseEvent) => {
      //   const target = e.target as L.Path;
      //   target.setStyle({
      //     fillColor: getCountryColor(country.properties.name),
      //     color: "darkblue",
      //   });
      // },
      click: () => {
        alert(`Selected ${countryName} country`);
      },
    });
  };

  return (
    <div className="flex-jsb-c">
      <LeftMenu />
      {indicators && (
        <MapContainer
          center={[51.505, -0.09]}
          zoom={3}
          className="w-[calc(100vw-300px)] h-[100dvh]"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <GeoJSON
            data={countriesData as any}
            style={countryStyle}
            onEachFeature={onEachCountry as any}
          />
        </MapContainer>
      )}

      <RightInfo />
    </div>
  );
}

export default Home;
