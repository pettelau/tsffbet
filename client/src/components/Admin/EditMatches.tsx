import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  AlertColor,
  Snackbar,
  Alert,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { AlertT, Match } from "../../types";
import AlertComp from "../Alert";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export type Bet = {
  // ... your Bet properties here
};

const MONTHS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

export default function UpdateMatches() {
  const url_path = useAppSelector(selectPath);

  const [matches, setMatches] = useState<Match[]>([]);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  //error toggle
  const [_alert, setAlert] = useState<boolean>(false);
  const [_alertType, setAlertType] = useState<AlertT>({
    type: "info",
    msg: "",
  });
  // Toggle error with message
  function toggleAlert(
    isActive: boolean,
    msg: string = "",
    type: AlertColor = "info"
  ) {
    setAlert(isActive);
    setAlertType({ type: type, msg: msg });
  }

  async function fetchMatches() {
    const response = await fetch(`${url_path}api/matcheswithodds`);
    setResponseCode(response.status);
    const resp = await response.json();

    if (response.ok) {
      setMatches(resp);
    } else {
      setResponseText(resp.detail);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  async function updateMatchScore(
    match_id: number,
    home_goals: number,
    away_goals: number
  ) {
    const match_obj = {
      match_id: match_id,
      home_goals: home_goals,
      away_goals: away_goals,
    };
    const response = await fetch(`${url_path}api/admin/updatematchscore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(match_obj),
    });
    const resp = await response.json();
    if (response.ok) {
      setOpenSuccessSnackbar(true);
      fetchMatches();
    } else {
      setOpenErrorSnackbar(true);
      toggleAlert(true, resp["errorMsg"], "error");
    }
  }

  async function updateMatchTime(match_id: number, ko_time: Date) {
    const match_obj = {
      match_id: match_id,
      ko_time: ko_time,
    };

    const response = await fetch(`${url_path}api/admin/updatematchtime`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(match_obj),
    });

    const resp = await response.json();
    if (response.ok) {
      fetchMatches();
      setOpenSuccessSnackbar(true);
    } else {
      setOpenErrorSnackbar(true);
    }
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return (
    <>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSuccessSnackbar(false)}
      >
        <Alert onClose={() => setOpenSuccessSnackbar(false)} severity="success">
          Kampen ble oppdatert!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenErrorSnackbar(false)}
      >
        <Alert onClose={() => setOpenErrorSnackbar(false)} severity="error">
          Noe galt skjedde: {responseCode}: {responseText}
        </Alert>
      </Snackbar>
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      <div>
        <h2>Kommende kamper</h2>

        {matches
          .filter(
            (match) => !match.ko_time || new Date(match.ko_time) >= twoHoursAgo
          )
          .sort((a, b) => {
            if (a.ko_time && b.ko_time) {
              return (
                new Date(a.ko_time).getTime() - new Date(b.ko_time).getTime()
              );
            }
            return 0;
          })
          .map((match) => (
            <Accordion key={match.match_id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography align="left">
                  {match.ko_time ? (
                    <>
                      <b>
                        {new Date(match.ko_time).getDate()}.{" "}
                        {MONTHS[new Date(match.ko_time).getMonth()].slice(0, 3)}{" "}
                        {new Date(match.ko_time).getFullYear()} kl.{" "}
                        {("0" + new Date(match.ko_time).getHours()).slice(-2)}:
                        {("0" + new Date(match.ko_time).getMinutes()).slice(-2)}
                        {": "}
                      </b>
                      <br />
                    </>
                  ) : (
                    ""
                  )}
                  {match.home_team} vs {match.away_team}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    sx={{ width: 400 }}
                    value={dayjs(match.ko_time)}
                    onChange={(e) => {
                      if (e) {
                        setMatches((prevMatches) =>
                          prevMatches.map((m) =>
                            m.match_id === match.match_id
                              ? { ...m, ko_time: e.toDate() }
                              : m
                          )
                        );
                      }
                    }}
                    ampm={false}
                  />
                </LocalizationProvider>
                <br />
                <br />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (match.ko_time !== undefined) {
                      updateMatchTime(match.match_id, new Date(match.ko_time));
                    }
                  }}
                >
                  Oppdater kamptidspunkt
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}
        <h2>Ferdige kamper</h2>
        {matches
          .filter(
            (match) => match.ko_time && new Date(match.ko_time) < twoHoursAgo
          )
          .map((match) => (
            <Accordion key={match.match_id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography align="left">
                  {match.ko_time ? (
                    <>
                      <b>
                        {new Date(match.ko_time).getDate()}.{" "}
                        {MONTHS[new Date(match.ko_time).getMonth()].slice(0, 3)}{" "}
                        {new Date(match.ko_time).getFullYear()} kl.{" "}
                        {("0" + new Date(match.ko_time).getHours()).slice(-2)}:
                        {("0" + new Date(match.ko_time).getMinutes()).slice(-2)}
                        {": "}
                      </b>
                      <br />
                    </>
                  ) : (
                    ""
                  )}
                  {match.home_team} vs {match.away_team}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  value={match.home_goals}
                  label={`Mål ${match.home_team}`}
                  type="number"
                  onChange={(e) => {
                    const homeGoalsValue =
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value);
                    setMatches((prevMatches) =>
                      prevMatches.map((m) =>
                        m.match_id === match.match_id
                          ? { ...m, home_goals: homeGoalsValue }
                          : m
                      )
                    );
                  }}
                />

                <TextField
                  value={match.away_goals}
                  label={`Mål ${match.away_team}`}
                  type="number"
                  onChange={(e) => {
                    const awayGoalsValue =
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value);
                    setMatches((prevMatches) =>
                      prevMatches.map((m) =>
                        m.match_id === match.match_id
                          ? { ...m, away_goals: awayGoalsValue }
                          : m
                      )
                    );
                  }}
                />
                <br />
                <br />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (
                      match.home_goals !== undefined &&
                      match.away_goals !== undefined
                    ) {
                      updateMatchScore(
                        match.match_id,
                        match.home_goals,
                        match.away_goals
                      );
                    }
                  }}
                >
                  Oppdater resultat
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}
      </div>
    </>
  );
}
