import { useState } from "react";
import clsx from "clsx";

interface IThisProps {
  item: ICountryData[];
}

function AccordionItem({ item }: IThisProps) {
  const [openClose, setOpenClose] = useState(false);
  const [splitCount, setSplitCount] = useState(5);

  return (
    <div className="px-2 border-b border-gray-300 py-2 mb-1">
      <div
        className={clsx(
          "flex-jsb-c gap-4 text-[14px] cursor-pointer font-semibold",
          {
            "mb-2": openClose,
          },
        )}
        onClick={() => setOpenClose(!openClose)}
      >
        {item[0].Indicator_name}
        <i
          className={clsx(
            "fa-solid fa-chevron-down text-[11px] transform transition",
            {
              "rotate-180": openClose,
            },
          )}
        />
      </div>

      <div className="pl-4">
        {openClose &&
          item.slice(0, splitCount).map((data, index) => (
            <div
              key={`data__${index}`}
              className={clsx(
                "text-[13px] border-b border-gray-200 py-2 flex-jsb-c",
                {
                  "!border-transparent": index === splitCount - 1,
                },
              )}
            >
              {data.Indicator_name}

              <b className="cursor-pointer text-blue-600">Add</b>
            </div>
          ))}

        {openClose && (
          <div className="flex-je-c mb-1">
            <span
              className="text-[12px] cursor-pointer text-blue-600 font-semibold"
              onClick={() => setSplitCount(item.length - 1)}
            >
              View more
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccordionItem;
