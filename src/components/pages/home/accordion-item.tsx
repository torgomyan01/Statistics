import { useState } from "react";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { setInfo, setRemoveInfo } from "@/redux/info";

interface IThisProps {
  item: ICountryData[];
  index: number;
}

function AccordionItem({ item, index }: IThisProps) {
  const dispatch = useDispatch();
  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );

  const [openClose, setOpenClose] = useState(false);

  function AddNewIndicatorCode(code: string) {
    dispatch(setInfo(code));
  }

  function RemoveIndicatorCode(code: string) {
    dispatch(setRemoveInfo(code));
  }

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
            <div
              key={`data__${index}`}
              className="text-[13px] border-b border-gray-200 py-2 flex-jsb-c"
            >
              {data.Indicator_name}

              {indicatorCode.includes(data.indicator_code) ? (
                <b
                  className="cursor-pointer text-red-600"
                  onClick={() => RemoveIndicatorCode(data.indicator_code)}
                >
                  X
                </b>
              ) : (
                <b
                  className="cursor-pointer text-blue-600"
                  onClick={() => AddNewIndicatorCode(data.indicator_code)}
                >
                  Add
                </b>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default AccordionItem;
