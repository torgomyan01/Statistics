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

  return (
    <div className="w-[400px] h-[180px] bg-white fixed right-6 bottom-6 z-[1000] p-4 rounded-[12px] pt-6">
      <div className="w-full">
        <Slider
          className="w-full"
          color="foreground"
          defaultValue={2020}
          label="Select Year"
          maxValue={2020}
          minValue={1960}
          size="md"
          step={1}
          onChange={handleSliderChange}
        />
      </div>

      <div className="w-full flex-jc-c px-6 mt-6">
        <span className="w-full h-[8px] bg-[#f39e8d] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">0</i>
        </span>
        <span className="w-full h-[8px] bg-[#f6b7ab] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">16</i>
        </span>
        <span className="w-full h-[8px] bg-[#ffd5be] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">32</i>
        </span>
        <span className="w-full h-[8px] bg-[#fffb00] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">50</i>
        </span>
        <span className="w-full h-[8px] bg-[#fffb00]/60 relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">66</i>
        </span>
        <span className="w-full h-[8px] bg-[#e6f19d] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">85</i>
        </span>
        <span className="w-full h-[8px] bg-[#d2e573] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            100
          </i>
        </span>
      </div>
    </div>
  );
}

export default RightInfo;
