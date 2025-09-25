import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry } from "geojson";
import { LeafletMouseEvent } from "leaflet";
import L from "leaflet";

import countriesData from "@/access/custom.geo.json";
import { useEffect, useState } from "react";
import { ActionGetSelectedCountry } from "@/app/actions/country/get";
import { Input } from "@heroui/input";
import AccordionItem from "@/components/pages/home/accordion-item";

interface CountryFeature extends Feature {
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: Geometry;
}

export const animals = [
  {
    label: "Cat",
    key: "cat",
    description: "The second most popular pet in the world",
  },
  {
    label: "Dog",
    key: "dog",
    description: "The most popular pet in the world",
  },
  {
    label: "Elephant",
    key: "elephant",
    description: "The largest land animal",
  },
  { label: "Lion", key: "lion", description: "The king of the jungle" },
  { label: "Tiger", key: "tiger", description: "The largest cat species" },
  { label: "Giraffe", key: "giraffe", description: "The tallest land animal" },
  {
    label: "Dolphin",
    key: "dolphin",
    description: "A widely distributed and diverse group of aquatic mammals",
  },
  {
    label: "Penguin",
    key: "penguin",
    description: "A group of aquatic flightless birds",
  },
  {
    label: "Zebra",
    key: "zebra",
    description: "A several species of African equids",
  },
  {
    label: "Shark",
    key: "shark",
    description:
      "A group of elasmobranch fish characterized by a cartilaginous skeleton",
  },
  {
    label: "Whale",
    key: "whale",
    description: "Diverse group of fully aquatic placental marine mammals",
  },
  {
    label: "Otter",
    key: "otter",
    description: "A carnivorous mammal in the subfamily Lutrinae",
  },
  {
    label: "Crocodile",
    key: "crocodile",
    description: "A large semiaquatic reptile",
  },
];

function Home() {
  const [datasets, setDatasets] = useState<ICountryData[] | null>(null);

  const [filteredRes, setFilteredRes] = useState<
    (ICountryData[] | undefined)[] | null
  >(null);

  useEffect(() => {
    const getAllGroup = [
      ...new Set(datasets?.map((data) => data.object.group)),
    ];

    const CreateGroup = getAllGroup.map((group) =>
      datasets?.filter((data) => data.object.group === group),
    );

    if (CreateGroup) {
      setFilteredRes(CreateGroup);
    }
  }, [datasets]);

  useEffect(() => {
    ActionGetSelectedCountry().then(({ data }) => {
      setDatasets(data as ICountryData[]);
    });
  }, []);

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
      return "green";
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
      <div className="w-[400px] h-[100dvh] border-r border-gray-200">
        <div className="w-full border-b p-4 flex-js-c border-gray-200">
          <h1 className="uppercase font-bold text-[20px] text-blue-900">
            Enhance Website
          </h1>
        </div>

        <div className="px-4 pt-4">
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mb-6">
            <Input label="Search Datasets" type="text" className="w-full" />
          </div>

          {filteredRes?.map(
            (data, index) =>
              data && (
                <AccordionItem item={data} key={`accardion-code-${index}`} />
              ),
          )}
        </div>
      </div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={2}
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
    </div>
  );
}

export default Home;
