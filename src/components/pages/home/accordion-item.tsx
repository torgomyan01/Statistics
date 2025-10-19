import { useCallback, useEffect, useState, useRef } from "react";
import clsx from "clsx";
import ItemIndicator from "@/components/common/item-indicator/item-indicator";
import { useDispatch, useSelector } from "react-redux";
import { setSelectGroup } from "@/redux/info";

interface IThisProps {
  item: IIndicatorData[];
  index: number;
}

function AccordionItem({ item, index }: IThisProps) {
  const dispatch = useDispatch();
  const [searchActive, setSearchActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const userManuallyOpenedRef = useRef(false);

  const groupName = `Group ${index + 1}`;

  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );
  const groupCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedGroup,
  );

  // Monitor search input changes
  useEffect(() => {
    const getInput: any = document.querySelector(".left-menu-input input");
    if (getInput) {
      const isSearchActive = Boolean(getInput.value);
      setSearchActive(isSearchActive);

      const handleInputChange = () => {
        setSearchActive(Boolean(getInput.value));
      };

      getInput.addEventListener("input", handleInputChange);
      return () => {
        getInput.removeEventListener("input", handleInputChange);
      };
    }
  }, []);

  // Auto-open groups when search is active
  useEffect(() => {
    if (searchActive) {
      setIsOpen(true);
      userManuallyOpenedRef.current = false; // Reset manual flag when search is active
    }
  }, [searchActive]);

  // Auto-open groups when they contain selected indicators (only if not manually opened)
  useEffect(() => {
    if (!searchActive && !userManuallyOpenedRef.current) {
      const hasSelectedIndicators = item.some((data) =>
        indicatorCode.includes(data.indicator_code),
      );
      setIsOpen(hasSelectedIndicators);
    }
  }, [searchActive, indicatorCode, item]);

  const toggleGroup = useCallback(() => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);

    // Mark as manually opened/closed
    userManuallyOpenedRef.current = true;

    // Update Redux state
    if (newOpenState) {
      // Opening - add to selected groups if not already there
      if (!groupCode.includes(groupName)) {
        const newGroups = [...groupCode, groupName];
        dispatch(setSelectGroup(newGroups));
      }
    } else {
      // Closing - remove from selected groups if it's there
      if (groupCode.includes(groupName)) {
        const newGroups = groupCode.filter((group) => group !== groupName);
        dispatch(setSelectGroup(newGroups));
      }
    }
  }, [isOpen, groupCode, groupName, dispatch]);

  return (
    <div className="px-2 border-b border-gray-300 dark:border-gray-700 py-2 mb-1 w-full max-w-full">
      <div
        className={clsx(
          "flex-jsb-c gap-4 text-[14px] cursor-pointer font-semibold dark:text-white",
          {
            "mb-2": isOpen,
          },
        )}
        onClick={toggleGroup}
      >
        {groupName}
        <i
          className="fa-solid fa-chevron-down text-[11px] transform transition"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>

      <div className="pl-2">
        {isOpen &&
          item.map((data, index) => (
            <ItemIndicator key={`data__${index}`} data={data} />
          ))}
      </div>
    </div>
  );
}

export default AccordionItem;
