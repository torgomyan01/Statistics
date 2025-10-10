import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { useState } from "react";

interface IThisProps {
  allCountry: any;
  onSelectCountry?: (countryName: string) => void;
}

function SelectCountry({ allCountry, onSelectCountry }: IThisProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function OnChangeCountry(country: any) {
    const name = typeof country === "string" ? country : String(country || "");
    setSelected(name || null);
    onSelectCountry?.(name);
  }

  return (
    <div className="absolute left-[50px] top-[12px] z-[1000] flex-js-c gap-2">
      <Autocomplete
        className="max-w-xs h-[]"
        label="Find Country"
        radius="sm"
        selectedKey={selected || undefined}
        onSelectionChange={OnChangeCountry}
      >
        {allCountry
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .map((country: any) => (
            <AutocompleteItem
              key={country.name}
              startContent={
                <Avatar
                  alt={country.name}
                  radius="none"
                  className="w-6 h-6"
                  src={`https://flagcdn.com/${country.isoCode.toLowerCase()}.svg`}
                />
              }
            >
              {country.name}
            </AutocompleteItem>
          ))}
      </Autocomplete>
    </div>
  );
}

export default SelectCountry;
