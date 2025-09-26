import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import { LeafletMouseEvent } from "leaflet";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import LeftMenu from "@/components/pages/home/left-menu";
import RightInfo from "@/components/pages/home/right-info";

interface CountryFeature extends Feature {
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: Geometry;
}

function Home() {
  const countryStyle = (feature: CountryFeature) => {
    return {
      fillColor: getCountryColor(feature.properties.name),
      color: "darkblue",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7,
    };
  };

  function getCountryColor(countryName: string): string {
    if (countryName === "United States" || countryName === "Russia") {
      return "#000";
    }
    return "lightblue";
  }

  const onEachCountry = (country: CountryFeature, layer: L.Layer) => {
    const countryName = country.properties.name;
    layer.bindPopup(countryName);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillColor: "blue",
          color: "darkblue",
        });
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillColor: getCountryColor(country.properties.name),
          color: "darkblue",
        });
      },
      click: () => {
        alert(`Selected ${countryName} country`);
      },
    });
  };

  return (
    <div className="flex-jsb-c">
      <LeftMenu />
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

      <RightInfo />
    </div>
  );
}

export default Home;
