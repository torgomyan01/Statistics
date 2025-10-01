import { useDispatch, useSelector } from "react-redux";
import { setInfo, setRemoveInfo } from "@/redux/info";

interface IThisProps {
  data: ICountryData;
}

function ItemIndicator({ data }: IThisProps) {
  const dispatch = useDispatch();
  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );

  function AddNewIndicatorCode(code: string) {
    dispatch(setInfo(code));
  }

  function RemoveIndicatorCode(code: string) {
    dispatch(setRemoveInfo(code));
  }

  return (
    <div className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c dark:text-gray-300">
      {data.Indicator_name}

      {indicatorCode.includes(data.indicator_code) ? (
        <b
          className="cursor-pointer text-red-600 dark:text-red-400 min-w-[40px] text-right"
          onClick={() => RemoveIndicatorCode(data.indicator_code)}
        >
          X
        </b>
      ) : (
        <b
          className="cursor-pointer text-blue-600 dark:text-blue-400 min-w-[40px] text-right"
          onClick={() => AddNewIndicatorCode(data.indicator_code)}
        >
          Add
        </b>
      )}
    </div>
  );
}

export default ItemIndicator;
