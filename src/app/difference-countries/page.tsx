"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/difference-countries/header";
import { ActionGetAllCountry } from "@/app/actions/counrty/get";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import people_info from "@/access/people_info.json";
const peopleData: any = people_info;

function Page() {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [selectedIsoCodeOne, setSelectedIsoCodeOne] = useState<
    string | number | null
  >(null);
  const [selectedIsoCodeTwo, setSelectedIsoCodeTwo] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    // Տվյալների բեռնում
    ActionGetAllCountry().then(({ data }) => {
      setCountries(data as ICountry[]);
    });
  }, []);

  const countryOneInfo = peopleData.filter(
    (info: any) => info["Country Code"] === selectedIsoCodeOne,
  );

  const countryTwoInfo = peopleData.filter(
    (info: any) => info["Country Code"] === selectedIsoCodeTwo,
  );

  const dataKeys = countryOneInfo.length
    ? Object.keys(countryOneInfo[0])
        .filter((key) => key !== "Country Code" && key !== "Country Name")
        .reverse()
    : [];

  const dataKeysTwo = countryOneInfo.length
    ? Object.keys(countryOneInfo[1])
        .filter((key) => key !== "Country Code" && key !== "Country Name")
        .reverse()
    : [];

  const formatter = new Intl.NumberFormat();

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500 font-inter`}
    >
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl mb-12 border-t-4 border-indigo-600 dark:border-indigo-500 transition-colors duration-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
            Select Countries for Comparison
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-around">
            <Autocomplete
              className="w-full sm:max-w-xs"
              label="Select country 1"
              radius="sm"
              onSelectionChange={(key) => setSelectedIsoCodeOne(key)}
            >
              {countries.map((country: ICountry) => (
                <AutocompleteItem
                  key={country.iso3} // Օգտագործում ենք iso3 որպես յուրահատուկ key
                  startContent={
                    <Avatar
                      alt={country.name}
                      radius="none"
                      className="w-6 h-6"
                      src={`https://flagcdn.com/${country.iso.toLowerCase()}.svg`}
                    />
                  }
                >
                  {country.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <Autocomplete
              className="w-full sm:max-w-xs"
              label="Select country 2"
              radius="sm"
              onSelectionChange={(key) => setSelectedIsoCodeTwo(key)} // Ավելացրել ենք onSelectionChange
            >
              {countries.map((country: ICountry) => (
                <AutocompleteItem
                  key={country.iso3} // Փոխել ենք country.name-ը country.iso3-ով
                  startContent={
                    <Avatar
                      alt={country.name}
                      radius="none"
                      className="w-6 h-6"
                      src={`https://flagcdn.com/${country.iso.toLowerCase()}.svg`}
                    />
                  }
                >
                  {country.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
        </div>

        {/* Համեմատական աղյուսակ */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl transition-colors duration-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
            Comparative Statistics (
            {countryOneInfo[0]?.["Country Name"] || "Country 1"} vs{" "}
            {countryTwoInfo[0]?.["Country Name"] || "Country 2"})
          </h2>

          <div className="rounded-xl dark:border-gray-700 flex justify-between gap-6">
            {dataKeys.length ? (
              <Table
                aria-label="Comparative statistics table"
                className="w-full border border-gray-200 rounded-2xl overflow-hidden"
                classNames={{
                  base: "max-h-[520px] overflow-scroll",
                  table: "min-h-[400px]",
                }}
                shadow="none"
                isHeaderSticky
              >
                <TableHeader>
                  <TableColumn key="metric">Metric</TableColumn>
                  <TableColumn key="country1">
                    {countryOneInfo[0]?.["Country Name"] || "Country 1 Data"}
                  </TableColumn>
                  <TableColumn key="country2">
                    {countryTwoInfo[0]?.["Country Name"] || "Country 2 Data"}
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {dataKeys.map((key) => (
                    <TableRow key={key}>
                      <TableCell className="font-semibold">{key}</TableCell>
                      <TableCell>
                        {countryOneInfo.length
                          ? countryOneInfo[0][key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {countryTwoInfo.length
                          ? countryTwoInfo[0][key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center w-full py-10 text-gray-600 dark:text-gray-400">
                Please select at least one country for comparison.
              </div>
            )}
          </div>

          <div className="rounded-xl dark:border-gray-700 flex justify-between gap-6 mt-6">
            {dataKeysTwo.length ? (
              <Table
                aria-label="Comparative statistics table"
                className="w-full border border-gray-200 rounded-2xl overflow-hidden"
                classNames={{
                  base: "max-h-[520px] overflow-scroll",
                  table: "min-h-[400px]",
                }}
                shadow="none"
                isHeaderSticky
              >
                <TableHeader>
                  <TableColumn key="metric">Metric</TableColumn>
                  <TableColumn key="country1">
                    {countryOneInfo[1]?.["Country Name"] || "Country 1 Data"}
                  </TableColumn>
                  <TableColumn key="country2">
                    {countryTwoInfo[1]?.["Country Name"] || "Country 2 Data"}
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {dataKeysTwo.map((key) => (
                    <TableRow key={key}>
                      <TableCell className="font-semibold">{key}</TableCell>
                      <TableCell>
                        {countryOneInfo.length
                          ? countryOneInfo[1][key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {countryTwoInfo.length
                          ? countryTwoInfo[1][key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;
