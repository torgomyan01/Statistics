import { useCallback, useEffect, useState } from "react";
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

  const getInput: any = document.querySelector(".left-menu-input input");

  // Open on mount if the left menu input exists
  useEffect(() => {
    if (getInput && getInput.value) {
      setOpenClose(true);
    }
  }, []);

  // Auto-open when matching group/indicator conditions are met.
  // Never force-close here so the user can manually close afterwards.
  useEffect(() => {
    if (openClose) {
      return;
    }

    if (
      groupCode.some((group: string) => group === groupName) &&
      !getInput.value
    ) {
      setOpenClose(true);
      return;
    }

    if (
      indicatorCode.length &&
      item.some((_i) =>
        indicatorCode.some((indicator) => _i.indicator_code === indicator),
      ) &&
      !getInput.value
    ) {
      setOpenClose(true);
    }
  }, [groupCode, indicatorCode, item, groupName, openClose]);

  const CheckGroup = useCallback(() => {
    const isInGroup = groupCode.some((group: string) => group === groupName);

    // If currently open, allow user to close regardless of auto-open reasons
    if (openClose) {
      setOpenClose(false);
      if (isInGroup) {
        const newGroup = groupCode.filter(
          (group: string) => group !== groupName,
        );
        dispatch(setSelectGroup(newGroup));
      }
      return;
    }

    // If currently closed, open and reflect selection in global state
    setOpenClose(true);
    if (!isInGroup) {
      const newGroup = [...groupCode, groupName];
      dispatch(setSelectGroup(newGroup));
    }
  }, [openClose, groupCode, groupName, dispatch]);

  return (
    <div className="px-2 border-b border-gray-300 dark:border-gray-700 py-2 mb-1 w-full max-w-full">
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
