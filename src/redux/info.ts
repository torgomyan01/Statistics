import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInterface {
  selectedIndicator: string[];
  selectedScoreYear: number;
  selectedCountry: string | null;
}

const initialState: IInterface = {
  selectedIndicator: ["EG.ELC.ACCS.ZS"],
  selectedScoreYear: 2020,
  selectedCountry: null,
};

export const siteInfo = createSlice({
  name: "info",
  initialState,
  reducers: {
    setInfo: (state, action: PayloadAction<string>) => {
      state.selectedIndicator = [...state.selectedIndicator, action.payload];
    },
    setRemoveInfo: (state, action: PayloadAction<string>) => {
      state.selectedIndicator = state.selectedIndicator.filter(
        (i) => i !== action.payload,
      );
    },
    setClearAll: (state) => {
      state.selectedIndicator = [];
    },

    setYear: (state, action: PayloadAction<number>) => {
      state.selectedScoreYear = action.payload;
    },

    setSelectCountry: (state, action: PayloadAction<string | null>) => {
      state.selectedCountry = action.payload;
    },
  },
});

export const {
  setInfo,
  setRemoveInfo,
  setYear,
  setClearAll,
  setSelectCountry,
} = siteInfo.actions;
export default siteInfo.reducer;
