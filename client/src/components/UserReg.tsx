import { useState, useEffect } from "react";
import { LoginUtils } from "../utils";
import { Link, Navigate } from "react-router-dom";

import TextField from "@mui/material/TextField";
import { AlertTitle, Button, InputAdornment } from "@mui/material";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USER, ADD_USER } from "../queries";
import Alert, { AlertColor } from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setUsername } from "../redux/userSlice";
import AlertComp from "./Alert";
import { AlertT } from "../types";
import { AccountCircle } from "@mui/icons-material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import KeyIcon from "@mui/icons-material/Key";

interface FetchedUserData {
  users: string[];
}

function UserReg() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  let alertmsg = "";

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

  //fetched user from neo4j
  const [_fetchedUser, setFetchedUser] = useState<FetchedUserData>();
  //fetch user with username {user}
  const [userAvailability] = useLazyQuery(GET_USER, {
    //jævla caching
    fetchPolicy: "network-only",
    onCompleted: (result) => {
      setFetchedUser(result);
    },
    onError: (error) => {
      console.log(JSON.stringify(error, null, 2));
      alertmsg = "Something went wrong, check cl";
      toggleAlert(true, alertmsg);
    },
  });

  //set user with username and hashed password
  const [setUserDB] = useMutation(ADD_USER, {
    onCompleted: (result) => {
      // When complete, set all user logged in parameters
      alertmsg = `User ${user} created`;
      toggleAlert(true, alertmsg, "success");
      localStorage.setItem("userLoggedIn", user.toLowerCase());
      dispatch(setUsername(user.toLowerCase()));
      // Navigate to login page
      navigate("/login");
    },
    onError: (error) => {
      console.log(JSON.stringify(error, null, 2));
      alertmsg = "Something went wrong, check cl";
      toggleAlert(true, alertmsg, "error");
    },
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
          userAvailability({ variables: { where: { username: user } } });
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
    if (_fetchedUser) {
      if (_fetchedUser.users.length > 0) {
        alertmsg = `User '${user}' is taken, please try something else`;
        toggleAlert(true, alertmsg, "error");
      } else {
        //hash pass and set to neo4j
        let hashedPass = LoginUtils.salthash(pass);
        setUserDB({
          variables: {
            input: {
              firstname: firstname,
              lastname: lastname,
              username: user.toLowerCase(),
              password: hashedPass,
            },
          },
        });
      }
    }
  }, [_fetchedUser]);

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
        <h1>Opprett bruker i LauBet </h1>
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
              Passordet blir "kvernet" (hashet) til en ugjenkjennelig streng.
              Dermed er det umulig for meg å se passordet ditt, men vil
              allikevel anbefale å bruke et passord det ikke er så "farlig" med.
            </Alert>
          </div>
        </div>
        <div>
          <Button
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
