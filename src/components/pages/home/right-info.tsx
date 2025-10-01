import { Slider } from "@heroui/react";
import { useDispatch } from "react-redux";
import { useCallback, useRef, useState } from "react";
import { setYear } from "@/redux/info";
import clsx from "clsx";

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

  const [openClose, setOpenClose] = useState(false);

  return (
    <div
      className={clsx(
        "w-[400px] h-[180px] bg-white dark:bg-gray-800 fixed right-6 bottom-6 z-[1000] p-4 rounded-[12px] pt-6 transform transition",
        {
          "translate-x-[100%]": openClose,
        },
      )}
    >
      <div
        className="w-7 h-14 bg-white dark:bg-gray-800 top-3 right-[100%] absolute flex-jc-c rounded-[6px_0_0_6px] text-[14px] text-gray-500 dark:text-gray-400 cursor-pointer"
        onClick={() => setOpenClose(!openClose)}
      >
        <i
          className={clsx("fa-solid fa-chevron-right transform transition", {
            "rotate-180": openClose,
          })}
        />
      </div>

      <div className="w-full">
        <Slider
          className="w-full"
          color="foreground"
          defaultValue={2020}
          label="Select Year"
          maxValue={2020}
          minValue={1960}
          size="sm"
          step={1}
          onChange={handleSliderChange}
        />
      </div>

      <div className="w-full flex-jc-c px-6 mt-6">
        <span className="w-full h-[8px] bg-[#f39e8d] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            0
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#f6b7ab] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            16
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#ffd5be] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            32
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#fffb00] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            50
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#fffb00]/60 relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            66
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#e6f19d] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            85
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#d2e573] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px] dark:text-white">
            100
          </i>
        </span>
      </div>
    </div>
  );
}

export default RightInfo;
