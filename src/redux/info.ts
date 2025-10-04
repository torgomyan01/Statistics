import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInterface {
  allIndicators: ICountryData[] | null;
  selectedIndicator: string[];
  selectedScoreYear: number;
  selectedCountry: string | null;
  selectedCountryIso: string | null;
}

const initialState: IInterface = {
  allIndicators: null,
  selectedIndicator: ["EG.ELC.ACCS.ZS"],
  selectedScoreYear: 2020,
  selectedCountry: null,
  selectedCountryIso: null,
};

export const siteInfo = createSlice({
  name: "info",
  initialState,
  reducers: {
    setAllIndicators: (state, action: PayloadAction<ICountryData[] | null>) => {
      state.allIndicators = action.payload;
    },
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
    setSelectCountryIso: (state, action: PayloadAction<string | null>) => {
      state.selectedCountryIso = action.payload;
    },
  },
});

export const {
  setInfo,
  setRemoveInfo,
  setYear,
  setClearAll,
  setSelectCountry,
  setSelectCountryIso,
  setAllIndicators,
} = siteInfo.actions;
export default siteInfo.reducer;
