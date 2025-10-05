import { Slider } from "@heroui/react";
import { useDispatch } from "react-redux";
import { useCallback, useRef } from "react";
import { setYear } from "@/redux/info";
import clsx from "clsx";

interface IThisProps {
  absolute?: boolean;
}

function RightInfo({ absolute = true }: IThisProps) {
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

  return (
    <div
      className={clsx("w-full md:w-[50%] m-auto z-[1000] px-4 py-4", {
        "absolute right-0 left-0 bottom-4": absolute,
        relative: !absolute,
      })}
    >
      <div className="w-full flex-jsb-c relative top-6 z-[-1]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`solid__${i}`} className="w-[1px] h-[30px] bg-black/20" />
        ))}
      </div>
      <div className="w-full slider-right relative z-[1000] mb-4">
        <Slider
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
        />
      </div>
      <div className="w-[calc(100%+40px)] -ml-[20px] flex-jsb-c mb-[-10px]">
        <span>1960</span>
        <span>2024</span>
      </div>
    </div>
  );
}

export default RightInfo;
