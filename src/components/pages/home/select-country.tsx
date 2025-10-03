import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectCountry } from "@/redux/info";

interface IThisProps {
  allCountry: any;
}

function SelectCountry({ allCountry }: IThisProps) {
  const dispatch = useDispatch();

  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedCountry,
  );

  function OnChangeCountry(country: string) {
    dispatch(setSelectCountry(country));
  }

  return (
    <div className="absolute left-[50px] top-[12px] z-[1000] flex-js-c gap-2">
      <Autocomplete
        className="max-w-xs h-[]"
        label="Select country"
        radius="sm"
        selectedKey={indicatorCode}
        onSelectionChange={OnChangeCountry}
      >
        {allCountry.map((country: any) => (
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
