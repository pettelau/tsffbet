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
import { Bet, BetOption, LeaderboardData } from "../../types";
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

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function Leaderboard() {
  const dispatch = useAppDispatch();

  const url_path = useAppSelector(selectPath);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [fromDate, setFromDate] = React.useState<Dayjs | null>(
    dayjs().subtract(2, "month")
  );
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs());

  const [leaderboardData, setLeaderboardData] = React.useState<
    LeaderboardData[]
  >([]);

  async function fetchLeaderboard() {
    // const response = await fetch(
    //   `${url_path}api/leaderboard/?` +
    //     new URLSearchParams({
    //       fromDate: fromDate !== null ? fromDate.toISOString() : "",
    //       toDate: toDate !== null ? toDate.toISOString() : "",
    //     }),
    //   {
    //     headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    //   }
    // );
    // const resp = await response.json();

    const response = await fetch(`${url_path}api/leaderboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    setResponseCode(response.status);

    if (response.ok) {
      let sorted = resp.sort((a: any, b: any) => b.balance - a.balance);
      setLeaderboardData(sorted);
    } else {
      setResponseText(resp.detail);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  function bgColorChecker(index: number) {
    if (index == 0) {
      return "#90FF3F";
    } else if (index == 1) {
      return "#B4FF7C";
    } else if (index == 2) {
      return "#C8FF9F";
    } else if (index == leaderboardData.length - 1) {
      return "#FFA58B";
    } else {
      return "white";
    }
  }
  if (responseCode !== 200) {
    return <NoAccess responseCode={responseCode} responseText={responseText} />;
  }

  return (
    <>
      <h1>Leaderboard</h1>
      {/* Fra dato:
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
      </LocalizationProvider> */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Table className="Table" aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "white" }}>
              <TableCell>
                <b>Bruker</b>
              </TableCell>
              <TableCell align="center">
                <b>Balanse</b>
              </TableCell>
              <TableCell align="center">
                <b>Antall kuponger</b>
              </TableCell>
              <TableCell align="center">
                <b>Vunnede kuponger</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboardData.map((user, index) => {
              return (
                <>
                  <TableRow sx={{ backgroundColor: bgColorChecker(index) }}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell sx={{ width: 70 }} align="center">
                      {user.balance}
                    </TableCell>
                    <TableCell sx={{ width: 40 }} align="center">
                      {user.total_accums}
                    </TableCell>
                    <TableCell sx={{ width: 100 }} align="center">
                      {user.won_accums}
                      {user.total_accums !== 0
                        ? " (" +
                          ((user.won_accums / user.total_accums) * 100).toFixed(
                            1
                          ) +
                          "%)"
                        : ""}
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
