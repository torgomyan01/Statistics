import { Input } from "@heroui/input";
import AccordionItem from "@/components/pages/home/accordion-item";
import { useEffect, useState } from "react";
import { ActionGetSelectedCountry } from "@/app/actions/country/get";

function LeftMenu() {
  const [filteredRes, setFilteredRes] = useState<
    (ICountryData[] | undefined)[] | null
  >(null);

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

  return (
    <div className="w-[400px] h-[100dvh] border-r border-gray-200 overflow-hidden">
      <div className="w-full border-b p-4 flex-js-c border-gray-200">
        <h1 className="uppercase font-bold text-[20px] text-blue-900">
          Enhance Website
        </h1>
      </div>

      <div className="px-4 pt-4 h-full">
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mb-6">
          <Input label="Search Datasets" type="text" className="w-full" />
        </div>

        <div className="w-full h-[calc(100%-180px)] overflow-y-auto">
          {filteredRes?.map(
            (data, index) =>
              data && (
                <AccordionItem item={data} key={`accardion-code-${index}`} />
              ),
          )}
        </div>
      </div>
    </div>
  );
}

export default LeftMenu;
