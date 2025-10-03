import { Slider } from "@heroui/react";
import { useDispatch } from "react-redux";
import { useCallback, useRef } from "react";
import { setYear } from "@/redux/info";

function RightInfo() {
  const dispatch = useDispatch();
  const debounceTimerRef: any = useRef(null);

  const handleSliderChange = useCallback(
    (value: any) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        dispatch(setYear(value));
      }, 1000);
    },
    [dispatch],
  );

  // const findSelectedInfo: any = people_info.find(
  //   (country) => country["Country Code"] == indicatorCode.selectedCountry,
  // );

  return (
    <div className="w-full bg-white dark:bg-gray-800 absolute right-0 bottom-0 z-[1000] px-4 py-2 pb-3">
      <div className="w-full slider-right">
        <Slider
          className="w-full"
          color="foreground"
          defaultValue={2020}
          label="Select Year"
          maxValue={2020}
          minValue={1960}
          size="sm"
          radius="none"
          step={1}
          onChange={handleSliderChange}
        />
      </div>
    </div>
  );
}

export default RightInfo;
