import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import accumReducer from "./accumSlice"
import envSlice from "./envSlice";


// Create Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
    accum: accumReducer,
    env: envSlice
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
