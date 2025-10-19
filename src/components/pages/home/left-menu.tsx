import { Input } from "@heroui/input";
import AccordionItem from "@/components/pages/home/accordion-item";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActionGetAllIndicatorsWithCountryCounts } from "@/app/actions/industry/get";
import { Spinner } from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { setAllIndicators, setClearAll, setInfo } from "@/redux/info";
import clsx from "clsx";
import { useParams } from "next/navigation";

interface LeftMenuProps {
  isOpen?: boolean;
}

const LeftMenu: React.FC<LeftMenuProps> = ({ isOpen = false }) => {
  const dispatch = useDispatch();
  const { indicator_code }: { indicator_code: string } = useParams();

  useEffect(() => {
    if (indicator_code) {
      dispatch(setClearAll());

      setTimeout(() => {
        dispatch(setInfo(indicator_code));
      }, 300);
    }
  }, [indicator_code]);

  const [filteredRes, setFilteredRes] = useState<
    (IIndicatorData[] | undefined)[] | null
  >(null);
  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );

  const datasets = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.allIndicators,
  );
  const [indicators, setIndicators] = useState<IIndicatorData[] | null>(null);

  const selectedYear = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedScoreYear,
  );

  useEffect(() => {
    setIndicators(datasets);
  }, [datasets]);

  // Cache datasets in localStorage to avoid refetching on subsequent visits
  useEffect(() => {
    setIndicators(null);
    ActionGetAllIndicatorsWithCountryCounts(selectedYear).then(({ data }) => {
      dispatch(setAllIndicators(data as IIndicatorData[]));
    });
  }, [selectedYear]);

  useEffect(() => {
    const getAllGroup = [...new Set(indicators?.map((data) => data.group))];

    const CreateGroup = getAllGroup.map((group) =>
      indicators?.filter((data) => data.group === group),
    );

    if (CreateGroup) {
      setFilteredRes(CreateGroup as (IIndicatorData[] | undefined)[]);
    }
  }, [indicators]);

  // Initial fetch moved into the caching effect above

  const [searchResult, setSearchResult] = useState<
    (IIndicatorData[] | undefined)[] | null
  >(null);

  const [inputSearch, setInputSearch] = useState<string>("");

  const debounceTimerRef: any = useRef(null);

  const handleChangeInput = useCallback(
    (value: any) => {
      setInputSearch(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (value) {
          setSearchResult(null);

          const search = datasets?.filter((_indicator) =>
            _indicator.indicator_name
              ?.toLowerCase()
              .includes(value.toLowerCase()),
          );

          const getAllGroup = [...new Set(search?.map((data) => data.group))];

          const CreateGroup = getAllGroup.map((group) =>
            search?.filter((data) => data.group === group),
          );

          setSearchResult(CreateGroup);
        } else {
          setSearchResult(null);
        }
      }, 700);
    },
    [datasets],
  );

  function ClearAll() {
    dispatch(setClearAll());
  }

  const isDataLoading =
    !datasets || indicators === null || filteredRes === null;

  // Desktop renders content directly; mobile renders as drawer overlay

  return (
    <div
      className={clsx(
        "sm:min-w-[400px] w-full sm:w-[400px] h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 fixed md:relative md:z-[1000] z-[10000000] p-0 transform translate-x-0 transition",
        {
          "translate-x-[-100%]": isOpen,
        },
      )}
    >
      {isDataLoading ? (
        <div className="w-full h-full flex-jc-c">
          <Spinner color="secondary" className="dark:text-white" />
        </div>
      ) : (
        <div
          className="px-4 pt-4 h-full overflow-y-auto"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
          }}
        >
          <div
            className={clsx(
              "flex w-full flex-wrap md:flex-nowrap gap-4 mb-2 relative",
              {
                "mb-6": !indicatorCode.length,
              },
            )}
          >
            <Input
              label="Find Indicator"
              type="text"
              className="w-full h-12 left-menu-input"
              radius="sm"
              value={inputSearch}
              onValueChange={handleChangeInput}
              classNames={{
                input: "pr-8",
              }}
            />
            {inputSearch && (
              <i
                className="fa-solid fa-xmark absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer dark:text-white !bg-white dark:bg-gray-800 px-2 py-1 rounded-full"
                onClick={() => setInputSearch("")}
              />
            )}
          </div>

          {indicatorCode.length ? (
            <div className="w-full py-2 flex-je-c mb-4">
              <span
                className="text-[13px] flex-je-c gap-1 cursor-pointer dark:text-gray-400 dark:hover:text-white"
                onClick={ClearAll}
              >
                Clear all
                <i className="fa-solid fa-xmark"></i>
              </span>
            </div>
          ) : null}

          {inputSearch ? (
            searchResult ? (
              <div
                className="w-full overflow-y-auto pr-2"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  height: "calc(100% - 120px)",
                }}
              >
                {!searchResult.length ? (
                  <div className="w-full h-[400px] flex-jc-c">
                    <span className="text-[14px]">No indicator found</span>
                  </div>
                ) : (
                  <>
                    {searchResult.map((data, index) => (
                      <AccordionItem
                        item={data || []}
                        key={`accardion-code-${index}`}
                        index={index}
                      />
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[300px] flex-jc-c">
                <Spinner color="secondary" className="dark:text-white" />
              </div>
            )
          ) : (
            <>
              {filteredRes ? (
                <div
                  className="w-full h-[calc(100%-120px)] overflow-y-auto"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                  }}
                >
                  {filteredRes.map(
                    (data, index) =>
                      data && (
                        <AccordionItem
                          item={data}
                          key={`accardion-code-${index}`}
                          index={index}
                        />
                      ),
                  )}
                </div>
              ) : (
                <div className="w-full h-[400px] flex-jc-c">
                  <Spinner color="secondary" className="dark:text-white" />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftMenu;
