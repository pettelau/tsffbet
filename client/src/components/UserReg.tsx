import { useState, useEffect, ChangeEvent } from "react";
import { LoginUtils } from "../utils";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

import TextField from "@mui/material/TextField";
import {
  AlertTitle,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import Alert, { AlertColor } from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setUsername } from "../redux/userSlice";
import AlertComp from "./Alert";
import { AlertT, Team, UserAvailability } from "../types";
import { AccountCircle, ConstructionOutlined } from "@mui/icons-material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import KeyIcon from "@mui/icons-material/Key";
import { selectPath } from "../redux/envSlice";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

function UserReg() {
  const navigate = useNavigate();

  let alertmsg = "";

  const dispatch = useAppDispatch();
  const url_path = useAppSelector(selectPath);

  const [missingUsername, setMissingUsername] = useState<boolean>(false);
  const [missingFirstname, setMissingFirstname] = useState<boolean>(false);

  //password local component state
  const [pass, setPass] = useState("");
  //password local component state
  const [confirmPass, setConfirmPass] = useState("");
  //user local component state
  const [user, setUser] = useState("");
  //user local component state
  const [firstname, setFirstname] = useState("");
  //user local component state
  const [lastname, setLastname] = useState("");
  //error toggle
  const [_alert, setAlert] = useState<boolean>(false);
  const [_alertType, setAlertType] = useState<AlertT>({
    type: "info",
    msg: "",
  });

  const [acceptedConditions, setAcceptedConditions] = useState<boolean>(false);
  const [associatedTeam, setAssociatedTeam] = useState<undefined | number>();

  const [teams, setTeams] = useState<Team[]>([]);

  // //fetched user from neo4j
  const [userAvailability, setUserAvailability] = useState<UserAvailability>({
    checkedDB: false,
    userTaken: false,
  });

  const fetchUserAvailability = async (user: string) => {
    const response = await fetch(`${url_path}api/userAvailability/${user}`);
    const resp = await response.json();

    setUserAvailability({ checkedDB: true, userTaken: resp["userTaken"] });
  };

  const fetchTeams = async () => {
    const response = await fetch(`${url_path}api/teams`);
    const resp = await response.json();
    setTeams(resp.teams as Team[]);
  };

  // Toggle error with message
  function toggleAlert(
    isActive: boolean,
    msg: string = "",
    type: AlertColor = "info"
  ) {
    setAlert(isActive);
    setAlertType({ type: type, msg: msg });
  }

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAcceptedConditions(event.target.checked);
  };

  const handleTeamChange = (event: SelectChangeEvent<number | "none">) => {
    const value =
      event.target.value === "none"
        ? undefined
        : (event.target.value as number);
    setAssociatedTeam(value);
  };

  // Create user first function
  function initCreateUser() {
    if (user == "" || firstname == "") {
      if (user == "") {
        setMissingUsername(true);
      }
      if (firstname == "") {
        setMissingFirstname(true);
      }
    } else {
      if (pass == confirmPass) {
        // Check if password fulfills criterias
        if (LoginUtils.verifyPass(pass)) {
          // Check if that username exists from before in DB
          fetchUserAvailability(user.toLowerCase());
        } else {
          alertmsg = "Passordet må være minst 6 tegn langt";
          toggleAlert(true, alertmsg, "error");
        }
      } else {
        alertmsg = "Passordene er ikke like";
        toggleAlert(true, alertmsg, "error");
      }
    }
  }

  // Create user part 2, useeffect on fetcheduser
  // Triggered when _fetchedUser state changes
  // If _fetchedUser is empty, it means username is not taken -> create user in DB
  useEffect(() => {
    //if username already taken
    if (userAvailability["checkedDB"]) {
      if (userAvailability["userTaken"]) {
        alertmsg = `Bruker '${user}' er tatt, vennligst velg et annet brukernavn`;
        toggleAlert(true, alertmsg, "error");
      } else {
        //hash pass and set to neo4j
        let hashedPass = LoginUtils.hashPass(pass);
        let newUser = {
          username: user,
          firstname: firstname,
          password: hashedPass,
          team_id: associatedTeam,
        };
        if (lastname !== "") {
          Object.assign(newUser, { lastname: lastname });
        }

        createUser(newUser);
      }
    }
  }, [userAvailability]);

  const createUser = async (newUser: Object) => {
    const response = await fetch(`${url_path}api/createUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const resp = await response.json();
    if (resp.userCreated) {
      navigate("/login");
    } else {
      alertmsg = `Bruker ble ikke opprettet, noe gikk galt. Send melding til Lau. Error message: ${resp}`;
      toggleAlert(true, alertmsg, "error");
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
      <div className="userReg">
        <div>
          <Button
            component={Link}
            to="/login"
            sx={{
              color: "#1d2528",
              mt: 2,
              ":hover": {
                color: "#ffffff",
                backgroundColor: "#1d2528",
              },
            }}
          >
            <b>Allerede bruker? Klikk her</b>
          </Button>
        </div>
        <h1>Opprett bruker i TSFFBet </h1>
        <div className="register-fields">
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InsertEmoticonIcon />
                </InputAdornment>
              ),
            }}
            error={missingUsername ? true : false}
            helperText={missingUsername ? "Dette feltet må fylles ut" : ""}
            id="register-username"
            label="Brukernavn*"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setMissingUsername(false);
            }}
          />{" "}
          <br /> <br />
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            error={missingFirstname ? true : false}
            helperText={missingFirstname ? "Dette feltet må fylles ut" : ""}
            id="register-firstname"
            label="Fornavn*"
            value={firstname}
            onChange={(e) => {
              setFirstname(e.target.value);
              setMissingFirstname(false);
            }}
          />{" "}
          <br /> <br />
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            id="register-lastname"
            label="Etternavn"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />{" "}
          <br /> <br />
          <FormControl sx={{ width: 223.5 }} variant="outlined">
            <InputLabel id="team-select-label">Velg tilknyttet lag</InputLabel>
            <Select
              labelId="team-select-label"
              id="team-select"
              value={associatedTeam ?? "none"}
              onChange={handleTeamChange}
              label="Velg tilknyttet lag"
            >
              <MenuItem value="none">Ikke tilknyttet noe lag</MenuItem>
              {/* Option to unselect a team */}
              {teams.map((team) => (
                <MenuItem key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br /> <br />
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
            }}
            id="register-password"
            type={"password"}
            label="Passord*"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />{" "}
          <br /> <br />
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
            }}
            id="confirm-password"
            type={"password"}
            label="Bekreft passord*"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <br />
          <br />
          <div
            style={{
              maxWidth: 500,
              display: "grid",
              margin: "auto",
              textAlign: "center",
            }}
          >
            <Alert severity="info">
              <AlertTitle>Lagring av passord</AlertTitle>
              Passordet blir hashet til en ugjenkjennelig streng både på klient-
              og serverside. Dermed er det umulig for meg eller noen andre å se
              passordet ditt, men ettersom dette bare er et hobbyprosjekt ønsker
              jeg at du bruker et ufarlig passord.
            </Alert>
          </div>
        </div>
        <br />
        <FormControlLabel
          sx={{ maxWidth: 500 }}
          control={
            <Checkbox
              checked={acceptedConditions}
              onChange={handleCheckboxChange}
              name="myCheckbox"
              color="primary"
            />
          }
          label="Jeg godtar at TSFFBet lagrer brukerinformasjonen ovenfor og jeg godtar at TSFFBet ikke står ansvarlig for noe av denne dataen dersom den skulle kommet på avveie."
        />
        <div>
          <Button
            disabled={!acceptedConditions}
            id="register-user-button"
            variant="contained"
            onClick={() => initCreateUser()}
            sx={{
              color: "#ffffff",
              backgroundColor: "#1d2528",
              mt: 2,
              ":hover": {
                color: "#ffffff",
                backgroundColor: "#1d2528",
              },
            }}
          >
            <b> Opprett bruker </b>
          </Button>
          <br />
          <br />
          <br />
          <br />
        </div>
      </div>
    </>
  );
}

export default UserReg;
