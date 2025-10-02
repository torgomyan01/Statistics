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

  const check = indicatorCode.includes(data.indicator_code);

  return check ? (
    <div
      className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c
      dark:text-gray-300 cursor-pointer
      bg-gray-300 font-bold px-2
      dark:bg-gray-600"
      onClick={() => RemoveIndicatorCode(data.indicator_code)}
    >
      {data.Indicator_name}
    </div>
  ) : (
    <div
      className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c
      dark:text-gray-300 cursor-pointer
      px-2"
      onClick={() => AddNewIndicatorCode(data.indicator_code)}
    >
      {data.Indicator_name}
    </div>
  );
}

export default ItemIndicator;
