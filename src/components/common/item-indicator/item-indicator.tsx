import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setInfo, setRemoveInfo } from "@/redux/info";

interface IThisProps {
  data: ICountryData;
}

function ItemIndicator({ data }: IThisProps) {
  const dispatch = useDispatch();
  // Select only what this component needs (boolean) to minimize re-renders
  const check = useSelector((state: IStateSiteInfo) =>
    state.siteInfo.selectedIndicator.includes(data.indicator_code),
  );

  const AddNewIndicatorCode = useCallback(
    (code: string) => {
      dispatch(setInfo(code));
    },
    [dispatch],
  );

  const RemoveIndicatorCode = useCallback(
    (code: string) => {
      dispatch(setRemoveInfo(code));
    },
    [dispatch],
  );

  return check ? (
    <div
      className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c
      dark:text-gray-300 cursor-pointer
      bg-gray-300 font-bold px-2
      dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => RemoveIndicatorCode(data.indicator_code)}
    >
      {data.Indicator_name}
    </div>
  ) : (
    <div
      className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c
      dark:text-gray-300 cursor-pointer
      px-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => AddNewIndicatorCode(data.indicator_code)}
    >
      {data.Indicator_name}
    </div>
  );
}

export default memo(ItemIndicator);
