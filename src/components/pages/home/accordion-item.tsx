import { useCallback, useEffect, useRef, useState } from "react";
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

  // Track whether user has manually overridden open state for the current context
  const lastContextKeyRef = useRef<string>("");
  const userOverrideRef = useRef<boolean>(false);

  useEffect(() => {
    const getInput: any = document.querySelector(".left-menu-input input");
    const searchActive = Boolean(getInput?.value);

    // Build a context signature; when this changes, reset manual override
    const hasIndicatorInGroup = item.some((_i) =>
      indicatorCode.some((indicator) => _i.indicator_code === indicator),
    );
    const isGroupSelected = groupCode.some(
      (group: string) => group === groupName,
    );
    const contextKey = `${searchActive ? 1 : 0}|${isGroupSelected ? 1 : 0}|${
      hasIndicatorInGroup ? 1 : 0
    }`;

    const contextChanged = contextKey !== lastContextKeyRef.current;
    if (contextChanged) {
      lastContextKeyRef.current = contextKey;
      userOverrideRef.current = false;

      // Default behavior on context change
      if (searchActive) {
        setOpenClose(true);
        return;
      }
      if (isGroupSelected) {
        setOpenClose(true);
        return;
      }
      if (hasIndicatorInGroup) {
        setOpenClose(true);
        return;
      }
      setOpenClose(false);
      return;
    }

    // If user has not overridden and search becomes active while same context, still force open
    if (!userOverrideRef.current && searchActive) {
      setOpenClose(true);
    }
  }, [groupCode, indicatorCode, item, groupName]);

  const CheckGroup = useCallback(() => {
    const isInGroup = groupCode.some((group: string) => group === groupName);

    // If currently open, allow user to close regardless of auto-open reasons
    if (openClose) {
      userOverrideRef.current = true;
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
    userOverrideRef.current = true;
    setOpenClose(true);
    if (!isInGroup) {
      const newGroup = [...groupCode, groupName];
      dispatch(setSelectGroup(newGroup));
    }
  }, [openClose, groupCode, groupName, dispatch, indicatorCode]);

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
