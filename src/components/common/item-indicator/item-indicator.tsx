import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setInfo, setRemoveInfo } from "@/redux/info";

interface IThisProps {
  data: IIndicatorData;
}

function ItemIndicator({ data }: IThisProps) {
  const dispatch = useDispatch();
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
      <span className="flex-1">{data.indicator_name}</span>
      <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
        {data.country_count}
      </span>
    </div>
  ) : (
    <div
      className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c
      dark:text-gray-300 cursor-pointer
      px-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => AddNewIndicatorCode(data.indicator_code)}
    >
      <span className="flex-1">{data.indicator_name}</span>
      <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
        {data.country_count}
      </span>
    </div>
  );
}

export default memo(ItemIndicator);
