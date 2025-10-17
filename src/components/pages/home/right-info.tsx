import Slider from "@mui/material/Slider";
import { useDispatch } from "react-redux";
import { useCallback, useRef } from "react";
import { setYear } from "@/redux/info";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/utils/consts";

interface IThisProps {
  absolute?: boolean;
}

const marks = Array.from({ length: 20 }, (_, i) => ({
  value: 1960 + i * 4,
  label: `${1960 + i * 4} ${1960 + i * 4 === 2024 ? "(Low Data)" : ""}`,
}));

function valuetext(value: number) {
  return `${value}`;
}

function RightInfo({ absolute = true }: IThisProps) {
  const parentPath = usePathname();
  const dispatch = useDispatch();
  const debounceTimerRef: any = useRef(null);

  const handleSliderChange = useCallback(
    (value: any) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        dispatch(setYear(value.target.value));
      }, 1000);
    },
    [dispatch],
  );

  return (
    <div
      className={clsx(
        "w-full md:w-[80%] m-auto z-[1000] px-4 py-2 sm:py-4 slider-site",
        {
          "absolute right-0 left-0 bottom-0": absolute,
          relative: !absolute,
          "comparison-page": parentPath === SITE_URL.COMPARISON,
        },
      )}
    >
      {/* <div className="w-full flex-jsb-c relative top-6 z-[-1]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`solid__${i}`}
            className="w-[1px] h-[30px] bg-black/20 relative"
          >
            <span className="text-[10px] absolute top-full transform translate-x-[-50%] text-black">
              {1960 + i * 5}
            </span>
          </div>
        ))}
      </div> */}
      <div className="w-full slider-right relative z-[1000] sm:mb-4">
        <Slider
          color="primary"
          aria-label="Always visible"
          defaultValue={2023}
          min={1960}
          max={2024}
          getAriaValueText={valuetext}
          step={1}
          marks={marks}
          valueLabelDisplay="on"
          onChange={handleSliderChange}
        />

        {/* <Slider
          className="w-full"
          color="foreground"
          defaultValue={2024}
          maxValue={2024}
          minValue={1960}
          size="sm"
          radius="none"
          step={1}
          onChange={handleSliderChange}
          classNames={{
            track: "bg-gray-300",
            filler: "bg-gray-300",
          }}
        /> */}
      </div>
    </div>
  );
}

export default RightInfo;
