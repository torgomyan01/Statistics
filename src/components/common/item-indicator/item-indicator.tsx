import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setInfo, setRemoveInfo } from "@/redux/info";
import { idbGetIndicatorRows, idbSetIndicatorRows } from "@/utils/indexedDb";
import { ActionGetManyInfo } from "@/app/actions/industry/get-many";

interface IThisProps {
  data: ICountryData;
}

function ItemIndicator({ data }: IThisProps) {
  const dispatch = useDispatch();
  const check = useSelector((state: IStateSiteInfo) =>
    state.siteInfo.selectedIndicator.includes(data.indicator_code),
  );
  const selectedYear = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedScoreYear,
  );

  // Count from IndexedDB for this indicator and year
  const [count, setCount] = useState<number | null>(null);
  let debounceTimer: any = null as any;

  useEffect(() => {
    let isMounted = true;
    const code = data.indicator_code;
    const yearKey = String(selectedYear);

    // cache by (code, year)
    (window as any).__indicatorYearCountCache =
      (window as any).__indicatorYearCountCache || new Map<string, number>();
    const cache: Map<string, number> = (window as any)
      .__indicatorYearCountCache;
    const cacheKey = `${code}-${yearKey}`;

    // Try cache first
    const cached = cache.get(cacheKey);
    if (typeof cached === "number") {
      setCount(cached);
      return () => {
        isMounted = false;
      };
    }

    idbGetIndicatorRows(code)
      .then((rows) => {
        if (!isMounted) {
          return;
        }
        if (!Array.isArray(rows) || rows.length === 0) {
          // No cached data for this indicator, hide badge
          setCount(null);
          return;
        }
        // rows are ICountryData[] persisted from ActionGetManyInfo
        let valid = 0;
        for (const r of rows as any[]) {
          const val = r?.object?.[yearKey];
          if (val !== null && val !== undefined && val !== "") {
            valid += 1;
          }
        }
        cache.set(cacheKey, valid);
        setCount(valid);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [data.indicator_code, selectedYear]);

  // On selection toggle, wait 2s then ensure IndexedDB is up to date and refresh count
  useEffect(() => {
    let isMounted = true;
    const code = data.indicator_code;
    const yearKey = String(selectedYear);

    if (!check) {
      return () => {
        isMounted = false;
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      let rows = await idbGetIndicatorRows(code);
      if (!rows || rows.length === 0) {
        // Fetch from server and persist
        const resp = await ActionGetManyInfo([code]);
        const list = (resp?.data || []) as any[];
        const filtered = list.filter((r) => r?.indicator_code === code);
        if (filtered.length) {
          await idbSetIndicatorRows(code, filtered);
          rows = filtered;
        } else {
          rows = [];
        }
      }

      if (!isMounted) {
        return;
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        setCount(null);
      } else {
        let valid = 0;
        for (const r of rows as any[]) {
          const val = r?.object?.[yearKey];
          if (val !== null && val !== undefined && val !== "") {
            valid += 1;
          }
        }
        (window as any).__indicatorYearCountCache =
          (window as any).__indicatorYearCountCache ||
          new Map<string, number>();
        const cache: Map<string, number> = (window as any)
          .__indicatorYearCountCache;
        const cacheKey = `${code}-${yearKey}`;
        cache.set(cacheKey, valid);
        setCount(valid);
      }
    }, 2000);

    return () => {
      isMounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [check, data.indicator_code, selectedYear]);

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
      <span className="flex-1">{data.Indicator_name}</span>
      {count && (
        <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  ) : (
    <div
      className="text-[13px] border-b border-gray-200 dark:border-gray-700 py-2 flex-jsb-c
      dark:text-gray-300 cursor-pointer
      px-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => AddNewIndicatorCode(data.indicator_code)}
    >
      <span className="flex-1">{data.Indicator_name}</span>
      {count && (
        <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default memo(ItemIndicator);
