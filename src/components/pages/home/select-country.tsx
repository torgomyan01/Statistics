import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Tooltip,
} from "@heroui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectCountry } from "@/redux/info";

interface IThisProps {
  allCountry: any;
}

function SelectCountry({ allCountry }: IThisProps) {
  const dispatch = useDispatch();

  const [openClose, setOpenClose] = useState<boolean>(false);

  function OnChangeCountry(country: string) {
    if (country) {
      dispatch(setSelectCountry(country));
    }
  }

  return (
    // Կոնտեյներ
    <div className="absolute left-[50px] top-[12px] z-[1000] flex-js-c gap-2">
      {!openClose ? (
        <Tooltip
          content="Select Country"
          className="dark:bg-gray-700 dark:text-white"
        >
          <Button
            className="min-w-[10px] bg-white dark:bg-gray-800 text-[18px] rounded-[6px] dark:text-white"
            variant="flat"
            onPress={() => setOpenClose(!openClose)}
          >
            <i className="fa-regular fa-earth-americas" />
          </Button>
        </Tooltip>
      ) : (
        <Autocomplete
          className="max-w-xs h-[]"
          label="Select country"
          radius="sm"
          onSelectionChange={OnChangeCountry}
        >
          {allCountry.map((country: any) => (
            <AutocompleteItem
              key={country.name}
              startContent={
                <Avatar
                  alt={country.name}
                  className="w-6 h-6"
                  src={`https://flagcdn.com/${country.isoCode.toLowerCase()}.svg`}
                />
              }
            >
              {country.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
      )}
    </div>
  );
}

export default SelectCountry;
