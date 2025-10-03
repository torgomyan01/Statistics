import clsx from "clsx";
import { RandomKey } from "@/utils/helpers";
import { useState } from "react";

interface IThisProps {
  item: any;
  index: number;
}

function PrintInfoCountryDeff({ item, index }: IThisProps) {
  const [openCLoseOne, setOpenCLoseOne] = useState(false);

  return (
    <div
      key={`country_info__${index}`}
      className={clsx(
        "w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner overflow-hidden",
        {
          "h-[100px]": !openCLoseOne,
          "h-auto": openCLoseOne,
        },
      )}
    >
      <ul className="space-y-1">
        {Object.keys(item)
          .reverse()
          .map((key: any, i) => (
            <li key={RandomKey()} className="text-sm dark:text-gray-300">
              {i < 2 ? (
                <h4
                  className="text-lg text-blue-700 dark:text-blue-300 font-extrabold mt-1 mb-2 flex-jsb-c cursor-pointer"
                  onClick={() => setOpenCLoseOne(!openCLoseOne)}
                >
                  {item[key]}
                  {i === 0 && (
                    <i
                      className={clsx("fa-solid fa-chevron-down transform", {
                        "rotate-180": openCLoseOne,
                      })}
                    />
                  )}
                </h4>
              ) : (
                <p className="flex items-start">
                  <b className="font-semibold text-gray-600 dark:text-gray-200 mr-2 min-w-[100px]">
                    {key}:
                  </b>

                  <span className="text-gray-500 dark:text-gray-400">
                    {item[key]}
                  </span>
                </p>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default PrintInfoCountryDeff;
