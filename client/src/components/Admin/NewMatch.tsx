import { useEffect, useState } from "react";
import {
  AlertT,
  MatchSimple,
  NewMatchSimple,
  NewOptionType,
  Team,
} from "../../types";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import dayjs, { Dayjs } from "dayjs";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  AlertColor,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AlertComp from "../Alert";
import { selectAdmin } from "../../redux/userSlice";

export default function NewMatch() {
  const url_path = useAppSelector(selectPath);
  const isAdmin = useAppSelector(selectAdmin);

  type Groups =
    | "Avdeling A"
    | "Avdeling B"
    | "A-sluttspill"
    | "B-sluttspill"
    | "C-sluttspill"
    | "D-sluttspill"
    | "E-sluttspill";

  const GROUPS: Groups[] = [
    "Avdeling A",
    "Avdeling B",
    "A-sluttspill",
    "B-sluttspill",
    "C-sluttspill",
    "D-sluttspill",
    "E-sluttspill",
  ];

  const [teams, setTeams] = useState<Team[]>([]);
  const [homeTeam, setHomeTeam] = useState<number | null>();
  const [awayTeam, setAwayTeam] = useState<number | null>();

  const [chosenGroup, setChosenGroup] = useState<Groups | null>();

  const [KOTime, setKOTime] = useState<Dayjs | null>(dayjs());

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

  const fetchTeams = async () => {
    const response = await fetch(`${url_path}api/teams`);
    const resp = await response.json();
    setTeams(resp.teams as Team[]);
  };

  const addMatch = async () => {
    if (homeTeam && awayTeam && chosenGroup && KOTime) {
      let match_obj: NewMatchSimple = {
        ko_time: KOTime.toDate(),
        home_team_id: homeTeam,
        away_team_id: awayTeam,
        group: chosenGroup,
      };
      const response = await fetch(`${url_path}api/admin/creatematch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(match_obj),
      });

      const resp = await response.json();
      if (response.ok) {
        toggleAlert(true, "Matchen ble opprettet!", "success");
        setKOTime(dayjs());
        setHomeTeam(null);
        setAwayTeam(null);
        setChosenGroup("Avdeling A");
      } else {
        toggleAlert(true, resp["errorMsg"], "error");
      }
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);
  return (
    <>
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      <h2>Add nytt bet</h2>
      {isAdmin ? (
        <>
          <h3>Hjemmelag:</h3>
          <FormControl sx={{ width: 400 }} variant="outlined">
            <InputLabel htmlFor="home-team">Home Team</InputLabel>
            <Select
              labelId="home-team-label"
              id="home-team"
              value={homeTeam}
              onChange={(e) => setHomeTeam(Number(e.target.value))}
              label="Home Team"
            >
              {teams
                .filter((team) => team.team_id !== awayTeam)
                .map((team) => (
                  <MenuItem key={team.team_id} value={team.team_id}>
                    {team.team_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <h3>Bortelag:</h3>

          <FormControl variant="outlined" sx={{ width: 400 }}>
            <InputLabel htmlFor="away-team">Away Team</InputLabel>
            <Select
              labelId="away-team-label"
              id="away-team"
              value={awayTeam}
              onChange={(e) => setAwayTeam(Number(e.target.value))}
              label="Away Team"
            >
              {teams
                .filter((team) => team.team_id !== homeTeam)
                .map((team) => (
                  <MenuItem key={team.team_id} value={team.team_id}>
                    {team.team_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <h3>Avspark:</h3>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              sx={{ width: 400 }}
              value={KOTime}
              onChange={(newValue) => setKOTime(newValue)}
              ampm={false}
            />
          </LocalizationProvider>
          <br />
          <br />
          <h3>Avdeling/divisjon:</h3>
          <FormControl sx={{ width: 400 }} variant="outlined">
            <InputLabel htmlFor="group-select">Avdeling/divisjon</InputLabel>
            <Select
              labelId="group-select-label"
              id="group-select"
              value={chosenGroup || ""}
              onChange={(e) => setChosenGroup(e.target.value as Groups)}
              label="Avdeling/divisjon"
            >
              {GROUPS.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <br />
          <br />

          <Button
            variant="outlined"
            onClick={() => {
              addMatch();
            }}
          >
            Legg til kamp
          </Button>
        </>
      ) : (
        <div>Du er ikke admin.</div>
      )}
    </>
  );
}
