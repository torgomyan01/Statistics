import { configureStore } from "@reduxjs/toolkit";
import siteInfo from "@/redux/info";

export const store = configureStore({
  reducer: {
    siteInfo,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
