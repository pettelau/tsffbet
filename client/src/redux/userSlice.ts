import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface UserState {
    user_id: number
    username: string
}
// Initial User state, all values are empty initially
const initialState: UserState = {
  user_id: 1,
  username: "plauvrak",
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
   
  },
});

export const { setUsername } =
  userSlice.actions;

// Get data from Redux state
const selectUsername = (state: RootState) => state.user.username;
const selectUserid = (state: RootState) => state.user.user_id;

export { selectUsername, selectUserid };

export default userSlice.reducer;
