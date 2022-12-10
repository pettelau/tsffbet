import React, { useState, useEffect } from "react";
import { LoginUtils } from "../utils";
import { Link, useNavigate } from "react-router-dom";

import TextField from "@mui/material/TextField";
import { Avatar, Button, Card, Typography } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  logOut,
  selectAdmin,
  selectBalance,
  selectFirstname,
  selectLastname,
  selectUsername,
  setUserDetails,
} from "../redux/userSlice";
import { setUsername } from "../redux/userSlice";
import { AlertColor } from "@mui/material/Alert";
import AlertComp from "./Alert";
import { AlertT, UserDetails } from "../types";
import { deepPurple } from "@mui/material/colors";
import { selectPath } from "../redux/envSlice";

interface UserPassData {
  __typename: string;
  password: string;
}

interface FetchedUserPass {
  users: UserPassData[];
}

function Login() {
  //error toggle
  const [_alert, setAlert] = useState<boolean>(false);
  const [_alertType, setAlertType] = useState<AlertT>({
    type: "info",
    msg: "",
  });

  const dispatch = useAppDispatch();
  const url_path = useAppSelector(selectPath);

  const loggedInUser = useAppSelector(selectUsername);
  const firstname = useAppSelector(selectFirstname);
  const lastname = useAppSelector(selectLastname);
  const balance = useAppSelector(selectBalance);

  const isAdmin = useAppSelector(selectAdmin);

  //user password local component state
  const [pass, setPass] = useState("");
  //user local component state
  const [user, setUser] = useState("");
  //fetched password local component state
  const [_fetchedPass, setFetchedPass] = useState<FetchedUserPass>();

  const navigate = useNavigate();

  async function loginDetails() {
    const response = await fetch(`${url_path}api/login/details`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    console.log(resp);
    dispatch(setUserDetails(resp[0]));
  }

  useEffect(() => {
    loginDetails();
  }, [loggedInUser]);

  // Init login part 1
  async function initLogin() {
    if (user && pass) {
      let hashedPass = LoginUtils.hashPass(pass);
      const response = await fetch(
        `${url_path}api/login?` +
          new URLSearchParams({ user: user, password: hashedPass }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const resp = await response.json();
      console.log(resp);

      if (resp["loggedIn"]) {
        console.log("logged in!");
        localStorage.setItem("userLoggedIn", user.toLowerCase());
        localStorage.setItem("jwt", resp["jwt"]);
        dispatch(setUsername(user.toLowerCase()));
      } else {
        toggleAlert(true, "Feil brukernavn eller passord", "error");
      }
    } else toggleAlert(true, "Skriv inn både brukernavn og passord", "error");
  }

  // Function for logging out user. Removes all data stored on client side
  function onClickLogOut() {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("jwt");
    dispatch(logOut());
    setPass("");
    setUser("");
  }

  //toggle error with message
  function toggleAlert(
    isActive: boolean,
    msg: string = "",
    type: AlertColor = "info"
  ) {
    setAlert(isActive);
    setAlertType({ type: type, msg: msg });
  }

  return (
    <>
      {/* Alert component to show error/success messages */}
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      {/* Check if logged in. If true, map all countries user has been to */}
      {loggedInUser !== "" ? (
        <>
          <div
            style={{
              maxWidth: 500,
              display: "grid",
              margin: "auto",
              textAlign: "center",
            }}
          >
            <h2>Du er logget inn som {loggedInUser}</h2>
            {/* <Avatar sx={{ bgcolor: deepPurple[500] }}>
              {firstname.charAt(0)}
              {lastname == "" ? firstname.charAt(1) : lastname.charAt(0)}
            </Avatar> */}
            Fornavn: {firstname} <br />
            Etternavn: {lastname} <br />
            Saldo: {balance} <br /> <br />
          </div>
          <Button
            variant="contained"
            onClick={() => {
              navigate("/admin");
            }}
          >
            Gå til adminside
          </Button>
          <div>
            <Button
              variant="contained"
              onClick={onClickLogOut}
              sx={{
                color: "#ffffff",
                backgroundColor: "#1d2528",
                mt: 2,
                mb: 2,
                ":hover": {
                  color: "#ffffff",
                  backgroundColor: "#636e72",
                },
              }}
            >
              <b> Logg ut </b>
            </Button>
          </div>
        </>
      ) : (
        // if user not logged in, display log in page
        <>
          <div className="login">
            <div>
              <h1>Logg inn på brukeren din her</h1>
              <div className="login-fields">
                <TextField
                  id="login-username"
                  className=""
                  label="Brukernavn"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
                <TextField
                  id="login-password"
                  type={"password"}
                  label="Passord"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
              <div>
                <Button
                  id="login-user-button"
                  variant="contained"
                  onClick={initLogin}
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#1d2528",
                    mt: 2,
                    mb: 2,
                    ":hover": {
                      color: "#ffffff",
                      backgroundColor: "#636e72",
                    },
                  }}
                >
                  <b> Logg inn </b>
                </Button>
              </div>
              <div>
                <Button
                  id="register-button"
                  component={Link}
                  to="/UserReg"
                  sx={{
                    color: "#1d2528",
                    mt: 2,
                    ":hover": {
                      color: "#ffffff",
                      backgroundColor: "#1d2528",
                    },
                  }}
                >
                  <b>Ikke bruker enda? Klikk her</b>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Login;
