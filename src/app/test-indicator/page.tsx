"use client";

import { ActionGetSelectedCountry } from "../actions/industry/get";
import { useEffect } from "react";
import { ActionGetAllInfo } from "../actions/industry/get-indicatr-code";

function TestIndicatorPage() {
  useEffect(() => {
    ActionGetSelectedCountry().then((res) => {
      console.log(res);
    });

    ActionGetAllInfo("SI.POV.GAPS").then((res) => {
      console.log(res);

      const result = res.data.filter(
        (item: any) => item.object["2023_score"] !== "",
      );
      console.log(result);
    });
  }, []);

  return (
    <div>
      <h1>test indicator page</h1>
    </div>
  );
}

export default TestIndicatorPage;
