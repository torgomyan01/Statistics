import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInterface {
  allIndicators: IIndicatorData[] | null;
  selectedIndicator: string[];
  selectedScoreYear: number;
  selectedCountry: string | null;
  selectedCountryIso: string | null;
  selectedGroup: string[];
}

const initialState: IInterface = {
  allIndicators: null,
  selectedIndicator: ["SP.ADO.TFRT"],
  selectedScoreYear: 2023,
  selectedCountry: null,
  selectedCountryIso: null,
  selectedGroup: [],
};

export const siteInfo = createSlice({
  name: "info",
  initialState,
  reducers: {
    setAllIndicators: (
      state,
      action: PayloadAction<IIndicatorData[] | null>,
    ) => {
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
    setSelectGroup: (state, action: PayloadAction<string[]>) => {
      state.selectedGroup = action.payload;
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
  setSelectGroup,
} = siteInfo.actions;
export default siteInfo.reducer;
