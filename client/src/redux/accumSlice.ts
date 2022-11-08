import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AccumBetOption, BetOption } from "../types";
import { RootState } from "./store";

interface AccumState {
    bets: AccumBetOption[]
}

// Initial Accum state, all values are empty initially
const initialState: AccumState = {
    bets: []
};

// Redux Accum Slice
export const accumSlice = createSlice({
  name: "accum",
  initialState,
  // Reducers for mutating the Redux State
  reducers: {
    addBet: (state, action: PayloadAction<AccumBetOption>) => {
      state.bets.push(action.payload);
    },
    removeBet: (state, action: PayloadAction<AccumBetOption>) => {
    let index = state.bets.map((c) => c.option.option_id).indexOf(action.payload.option.option_id)
    if (index > -1) {
        state.bets.splice(index, 1);
    }
    },
    removeAccum: (state) => {
      state.bets = [];
    },
    
  },
});

export const { addBet, removeBet, removeAccum } =
  accumSlice.actions;

// Get data from Redux state
const selectAccum = (state: RootState) => state.accum.bets;

export { selectAccum };

export default accumSlice.reducer;
