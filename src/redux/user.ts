// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
//
// interface IInterface {
//   company: IUserCompany | null;
//   favorites: IUserFavorite[] | null;
// }
//
// const initialState: IInterface = {
//   company: null,
//   favorites: null,
// };
//
// export const userInfo = createSlice({
//   name: "filter-params",
//   initialState,
//   reducers: {
//     setCompany: (state, action: PayloadAction<IUserCompany | null>) => {
//       state.company = action.payload;
//     },
//     setFavorites: (state, action: PayloadAction<IUserFavorite[] | null>) => {
//       state.favorites = action.payload;
//     },
//     setRemoveFavorite: (state, action: PayloadAction<number>) => {
//       const filter = state.favorites?.filter(
//         (item) => item.id !== action.payload,
//       );
//
//       state.favorites = filter || null;
//     },
//     setAppendFavorites: (state, action: PayloadAction<IUserFavorite>) => {
//       if (state.favorites) {
//         state.favorites = [...state.favorites, action.payload];
//       } else {
//         state.favorites = null;
//       }
//     },
//   },
// });
//
// // Export actions and reducer
// export const {
//   setCompany,
//   setFavorites,
//   setAppendFavorites,
//   setRemoveFavorite,
// } = userInfo.actions;
// export default userInfo.reducer;
