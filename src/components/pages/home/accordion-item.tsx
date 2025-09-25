import { useState } from "react";
import clsx from "clsx";

interface IThisProps {
  item: ICountryData[];
}

function AccordionItem({ item }: IThisProps) {
  const [openClose, setOpenClose] = useState(false);

  return (
    <div className="px-2 border-b border-gray-300 py-2 mb-1">
      <div
        className={clsx("flex-jsb-c gap-4 text-[14px] cursor-pointer", {
          "mb-2": openClose,
        })}
        onClick={() => setOpenClose(!openClose)}
      >
        {item[0].Indicator_name}
        <i className="fa-solid fa-chevron-down text-[11px]"></i>
      </div>

      {openClose &&
        item.map((data, index) => (
          <div
            key={`data__${index}`}
            className="text-[14px] border-b border-gray-200 py-1"
          >
            {data.Indicator_name}
          </div>
        ))}
    </div>
  );
}

export default AccordionItem;
