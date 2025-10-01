import { Input } from "@heroui/input";
import AccordionItem from "@/components/pages/home/accordion-item";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionGetSelectedCountry } from "@/app/actions/industry/get";
import { ActionSearchIndicator } from "@/app/actions/industry/search";
import { Spinner } from "@heroui/react";
import ItemIndicator from "@/components/common/item-indicator/item-indicator";
import { useDispatch, useSelector } from "react-redux";
import { setClearAll, setInfo } from "@/redux/info";
import clsx from "clsx";
import { useParams } from "next/navigation";

function LeftMenu() {
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
    (ICountryData[] | undefined)[] | null
  >(null);
  const indicatorCode = useSelector(
    (state: IStateSiteInfo) => state.siteInfo.selectedIndicator,
  );

  const [datasets, setDatasets] = useState<ICountryData[] | null>(null);

  useEffect(() => {
    const getAllGroup = [
      ...new Set(datasets?.map((data) => data.object.group)),
    ];

    const CreateGroup = getAllGroup.map((group) =>
      datasets?.filter((data) => data.object.group === group),
    );

    if (CreateGroup) {
      setFilteredRes(CreateGroup);
    }
  }, [datasets]);

  useEffect(() => {
    ActionGetSelectedCountry().then(({ data }) => {
      setDatasets(data as ICountryData[]);
    });
  }, []);

  const [searchResult, setSearchResult] = useState<ICountryData[] | null>(null);
  const [inputSearch, setInputSearch] = useState<string>("");

  const debounceTimerRef: any = useRef(null);

  const handleChangeInput = useCallback((value: any) => {
    setInputSearch(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (value) {
        setSearchResult(null);
        ActionSearchIndicator(value).then(({ data }) => {
          const res: ICountryData[] = [];

          data.forEach((indicator: ICountryData) => {
            if (
              !res.some((_d) => _d.indicator_code === indicator.indicator_code)
            ) {
              res.push(indicator);
            }
          });

          setSearchResult(res);
        });
      } else {
        setSearchResult(null);
      }
    }, 700);
  }, []);

  function ClearAll() {
    dispatch(setClearAll());
  }

  return (
    <div className="w-[400px] h-[100dvh] border-r border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      <div className="w-full border-b p-4 flex-js-c border-gray-200 dark:border-gray-700">
        <h1 className="uppercase font-bold text-[20px] text-blue-900 dark:text-blue-400">
          Enhance Website
        </h1>
      </div>

      <div className="px-4 pt-4 h-full">
        <div
          className={clsx(
            "flex w-full flex-wrap md:flex-nowrap gap-4 mb-2 relative",
            {
              "mb-6": !indicatorCode.length,
            },
          )}
        >
          <Input
            label="Search Datasets"
            type="text"
            className="w-full h-10"
            radius="sm"
            value={inputSearch}
            onValueChange={handleChangeInput}
          />
          {inputSearch && (
            <i
              className="fa-solid fa-xmark absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer dark:text-white"
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
            <div className="w-full h-[calc(100%-180px)] overflow-y-auto pr-2">
              {searchResult.map((data, index) => (
                <ItemIndicator key={`data__${index}`} data={data} />
              ))}
            </div>
          ) : (
            <div className="w-full h-[300px] flex-jc-c">
              <Spinner color="secondary" className="dark:text-white" />
            </div>
          )
        ) : (
          <>
            {filteredRes ? (
              <div className="w-full h-[calc(100%-180px)] overflow-y-auto">
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
                {/* Spinner-ի գույնը dark mode-ում դարձնում ենք white */}
                <Spinner color="secondary" className="dark:text-white" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LeftMenu;
