import {
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React, { useEffect } from "react";
import { LeaderboardData, Team } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

import { selectPath } from "../../redux/envSlice";
import NoAccess from "../NoAccess";
import dayjs, { Dayjs } from "dayjs";

import { useNavigate } from "react-router-dom";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function Leaderboard() {
  const url_path = useAppSelector(selectPath);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [leaderboardData, setLeaderboardData] = React.useState<
    LeaderboardData[]
  >([]);

  const [filterTeam, setFilterTeam] = React.useState<undefined | number>();

  const [teams, setTeams] = React.useState<Team[]>([
    { team_id: -1, team_name: "Brukere uten lag" },
  ]);

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
    console.log(resp);
    if (response.ok) {
      let sorted = resp.sort((a: any, b: any) => b.balance - a.balance);
      setLeaderboardData(sorted);
    } else {
      setResponseText(resp.detail);
    }
  }

  const fetchTeams = async () => {
    const response = await fetch(`${url_path}api/teams`);
    const resp = await response.json();
    console.log(resp);
    setTeams((prevTeams) => {
      const newTeams = resp.teams as Team[];
      const combinedTeams = [...prevTeams, ...newTeams];

      const uniqueTeams = combinedTeams.filter(
        (team, index, self) =>
          index === self.findIndex((t) => t.team_id === team.team_id)
      );

      return uniqueTeams;
    });
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
    fetchLeaderboard();
  }, []);

  const handleTeamChange = (event: SelectChangeEvent<number | "none">) => {
    const value =
      event.target.value === "none"
        ? undefined
        : (event.target.value as number);
    setFilterTeam(value);

    console.log(value);
  };

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

  if (responseCode == undefined) {
    return (
      <>
        <br />
        <br />
        <br />
        <CircularProgress />
      </>
    );
  }

  if (responseCode !== 200) {
    return <NoAccess responseCode={responseCode} responseText={responseText} />;
  }

  return (
    <>
      <h1>Leaderboard</h1>
      <div
        style={{
          width: "90%",
          maxWidth: 800,
          display: "grid",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <Alert severity="info">
          Klikk på et brukernavn for å se alle kupongene til denne personen.
        </Alert>
      </div>
      <br />
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
      <div>
        <FormControl sx={{ width: 223.5 }} variant="outlined">
          <InputLabel id="team-select-label">
            Filtrer spillere på lag
          </InputLabel>
          <Select
            labelId="team-select-label"
            id="team-select"
            value={filterTeam ?? "none"}
            onChange={handleTeamChange}
            label="Filtrer spillere på lag"
          >
            <MenuItem value="none">Alle lag</MenuItem>
            <Divider />
            {/* Option to unselect a team */}
            {teams.map((team) => (
              <MenuItem key={team.team_id} value={team.team_id}>
                {team.team_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Table className="Table" aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "white" }}>
              <TableCell>
                <b>Bruker</b>
              </TableCell>
              <TableCell>
                <b>Lag</b>
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
              if (
                !filterTeam ||
                user.associated_team_id === filterTeam ||
                (user.associated_team_id === null && filterTeam === -1)
              ) {
                return (
                  <>
                    <TableRow sx={{ backgroundColor: bgColorChecker(index) }}>
                      <TableCell
                        sx={{
                          ":hover": { cursor: "pointer" },
                        }}
                        onClick={() => {
                          navigate(`/user/${user.username}`);
                        }}
                      >
                        {user.username}
                      </TableCell>
                      <TableCell sx={{ width: 70 }} align="center">
                        {user.associated_team ? user.associated_team : "Ingen"}
                      </TableCell>
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
                            (
                              (user.won_accums / user.total_accums) *
                              100
                            ).toFixed(1) +
                            "%)"
                          : ""}
                      </TableCell>
                    </TableRow>
                  </>
                );
              }
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
