import { Slider } from "@heroui/react";

function RightInfo() {
  return (
    <div className="w-[400px] h-[400px] bg-white fixed right-6 bottom-6 z-[1000] p-4 rounded-[12px] pt-6">
      <div className="w-full">
        <Slider
          className="w-full"
          color="foreground"
          defaultValue={1995}
          label="Access to electricity (% of population)"
          maxValue={2020}
          minValue={1995}
          showSteps={true}
          size="md"
          step={1}
        />
      </div>

      <div className="w-full flex-jc-c px-6 mt-6">
        <span className="w-full h-[8px] bg-[#f39e8d] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            -65.7
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#f6b7ab] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            -50.7
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#ffd5be] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            -35.8
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#ffffe9] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            -20.8
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#ecf6bd] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            -5.9
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#e6f19d] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">
            9.1
          </i>
        </span>
        <span className="w-full h-[8px] bg-[#d2e573] relative">
          <i className="absolute left-0 top-[calc(100%+5px)] text-[10px]">24</i>
        </span>
      </div>
    </div>
  );
}

export default RightInfo;
