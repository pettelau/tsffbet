import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDetails } from "../types";
import { RootState } from "./store";


// Initial User state, all values are empty initially
const initialState: UserDetails = {
  username: "",
  balance: 0,
  firstname: "njinjj",
  lastname: "",
};

// Redux User Slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  // Reducers for mutating the Redux State
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    logOut: (state) => {
      state.username = "";
      state.balance = 0;
    },
    setUserDetails: (state, action: PayloadAction<UserDetails>) => {
      state.username = action.payload.username
      state.firstname = action.payload.firstname
      state.lastname = action.payload.lastname
      state.balance = action.payload.balance
    }
  },
});

export const { setUsername, logOut, setUserDetails } =
  userSlice.actions;

// Get data from Redux state
const selectUsername = (state: RootState) => state.user.username;
const selectBalance = (state: RootState) => state.user.balance;
const selectFirstname = (state: RootState) => state.user.firstname;
const selectLastname = (state: RootState) => state.user.lastname;
const selectUserState = (state: RootState) => state.user;

export { selectUsername, selectBalance, selectFirstname, selectLastname, selectUserState };

export default userSlice.reducer;