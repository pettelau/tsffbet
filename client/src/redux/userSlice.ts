import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface UserState {
    username: string
}
// Initial User state, all values are empty initially
const initialState: UserState = {
  username: "",
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

export { selectUsername };

export default userSlice.reducer;
