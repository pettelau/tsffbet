import {
  Button,
  Card,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { useEffect } from "react";
import { Bet, BetOption } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addBet, removeBet, selectAccum } from "../../redux/accumSlice";
import {
  selectBalance,
  selectFirstname,
  selectLastname,
} from "../../redux/userSlice";
import { selectPath } from "../../redux/envSlice";
import useWindowDimensions from "../../utils/deviceSizeInfo";
import NoAccess from "../NoAccess";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Leaderboard() {
  const dispatch = useAppDispatch();

  const url_path = useAppSelector(selectPath);

  const [fromDate, setFromDate] = React.useState<Dayjs | null>(
    dayjs().subtract(2, "month")
  );
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs());

  async function fetchLeaderboard() {
    const response = await fetch(
      `${url_path}api/leaderboard/?` +
        new URLSearchParams({
          fromDate: fromDate !== null ? fromDate.toISOString() : "",
          toDate: toDate !== null ? toDate.toISOString() : "",
        }),
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      }
    );
    const resp = await response.json();
    console.log(resp);
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <>
      <h1>Leaderboard</h1>
      Fra dato:
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          value={fromDate}
          onChange={(newValue) => setFromDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
          ampm={false}
        />
      </LocalizationProvider>
      Til dato:
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          value={toDate}
          onChange={(newValue) => setToDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
          ampm={false}
        />
      </LocalizationProvider>
    </>
  );
}
