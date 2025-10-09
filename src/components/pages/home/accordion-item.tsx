import { useEffect, useState } from "react";
import clsx from "clsx";
import ItemIndicator from "@/components/common/item-indicator/item-indicator";
import { useDispatch, useSelector } from "react-redux";
import { setSelectGroup } from "@/redux/info";

interface IThisProps {
  item: ICountryData[];
  index: number;
}

function AccordionItem({ item, index }: IThisProps) {
  const dispatch = useDispatch();
  const [openClose, setOpenClose] = useState(false);

  const groupName = `Group ${index + 1}`;

  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );
  const groupCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedGroup,
  );

  useEffect(() => {
    if (groupCode.length) {
      const check = groupCode.some((group: string) => group === groupName);
      if (check) {
        setOpenClose(true);
      }
    }

    if (indicatorCode.length) {
      const check = indicatorCode.some((indicator) =>
        item.some((_i) => _i.indicator_code === indicator),
      );
      if (check) {
        setOpenClose(true);
      }
    }
  }, [groupCode, indicatorCode]);

  function CheckGroup() {
    const some = groupCode.some((group: string) => group === groupName);

    if (some) {
      const newGroup = groupCode.filter((group: string) => group !== groupName);
      dispatch(setSelectGroup(newGroup));
      setOpenClose(false);
    } else {
      const newGroup = [...groupCode, groupName];
      dispatch(setSelectGroup(newGroup));
      setOpenClose(true);
    }
  }

  return (
    <div className="px-2 border-b border-gray-300 dark:border-gray-700 py-2 mb-1">
      <div
        className={clsx(
          "flex-jsb-c gap-4 text-[14px] cursor-pointer font-semibold dark:text-white",
          {
            "mb-2": openClose,
          },
        )}
        onClick={CheckGroup}
      >
        {groupName}
        <i
          className={clsx(
            "fa-solid fa-chevron-down text-[11px] transform transition",
            {
              "rotate-180": openClose,
            },
          )}
        />
      </div>

      <div className="pl-2">
        {openClose &&
          item.map((data, index) => (
            <ItemIndicator key={`data__${index}`} data={data} />
          ))}
      </div>
    </div>
  );
}

export default AccordionItem;
