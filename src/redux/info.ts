import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInterface {
  selectedIndicator: string[];
  selectedScoreYear: number;
}

const initialState: IInterface = {
  selectedIndicator: ["EG.ELC.ACCS.ZS"],
  selectedScoreYear: 2020,
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

    setYear: (state, action: PayloadAction<number>) => {
      state.selectedScoreYear = action.payload;
    },
  },
});

export const { setInfo, setRemoveInfo, setYear } = siteInfo.actions;
export default siteInfo.reducer;
