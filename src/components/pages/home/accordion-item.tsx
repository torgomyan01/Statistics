import { useEffect, useState } from "react";
import clsx from "clsx";
import ItemIndicator from "@/components/common/item-indicator/item-indicator";
import { useSelector } from "react-redux";

interface IThisProps {
  item: ICountryData[];
  index: number;
}

function AccordionItem({ item, index }: IThisProps) {
  const [openClose, setOpenClose] = useState(false);
  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );

  console.log(item);

  useEffect(() => {
    if (indicatorCode.length) {
      const check = indicatorCode.some((indicator) =>
        item.some((_i) => _i.indicator_code === indicator),
      );
      if (check) {
        setOpenClose(true);
      }
    }
  }, []);

  return (
    <div className="px-2 border-b border-gray-300 dark:border-gray-700 py-2 mb-1">
      <div
        className={clsx(
          "flex-jsb-c gap-4 text-[14px] cursor-pointer font-semibold dark:text-white",
          {
            "mb-2": openClose,
          },
        )}
        onClick={() => setOpenClose(!openClose)}
      >
        Group {index + 1}
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
          item.map((data, index) => (
            <ItemIndicator key={`data__${index}`} data={data} />
          ))}
      </div>
    </div>
  );
}

export default AccordionItem;
