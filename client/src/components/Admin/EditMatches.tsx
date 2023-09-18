import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  AlertColor,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { AlertT } from "../../types";
import AlertComp from "../Alert";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export type Bet = {
  // ... your Bet properties here
};

export type Match = {
  match_id: number;
  ko_time: Date | undefined;
  group_name: string;
  home_team: string;
  away_team: string;
  home_goals: number | undefined;
  away_goals: string | undefined;
  match_bets: Bet[];
};

export default function UpdateMatches() {
  const url_path = useAppSelector(selectPath);

  const [matches, setMatches] = useState<Match[]>([]);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

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
    const response = await fetch(
      `${url_path}api/matcheswithodds?in_future=False`
    );
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
      fetchMatches();
    } else {
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
    } else {
      toggleAlert(true, resp["errorMsg"], "error");
    }
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const finishedMatches = matches.filter(
    (match) => match.ko_time && new Date(match.ko_time) < twoHoursAgo
  );
  const upcomingMatches = matches.filter(
    (match) => !match.ko_time || new Date(match.ko_time) >= twoHoursAgo
  );

  return (
    <>
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      <div>
        <h2>Finished Matches</h2>
        {finishedMatches.map((match) => (
          <Accordion key={match.match_id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{`${match.home_team} vs ${match.away_team}`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Home Goals"
                type="number"
                onChange={(e) => (match.home_goals = Number(e.target.value))}
              />
             
              <Button
                onClick={() => {
                  if (
                    match.home_goals !== undefined &&
                    match.away_goals !== undefined
                  ) {
                    updateMatchScore(
                      match.match_id,
                      match.home_goals,
                      Number(match.away_goals)
                    );
                  }
                }}
              >
                Update Score
              </Button>
            </AccordionDetails>
          </Accordion>
        ))}

        <h2>Upcoming Matches</h2>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {upcomingMatches.map((match) => (
            <Accordion key={match.match_id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{`${match.home_team} vs ${match.away_team}`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DateTimePicker
                  label="KO Time"
                  value={match.ko_time}
                  onChange={(newValue) => {
                    if (newValue) {
                      match.ko_time = newValue;
                      updateMatchTime(match.match_id, newValue);
                    }
                  }}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </LocalizationProvider>
      </div>
    </>
  );
}
