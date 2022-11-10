import React, { useState, useEffect } from "react";
import { LoginUtils } from "../utils";
import { Link } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { GET_HASH, GET_USER } from "../queries";

import TextField from "@mui/material/TextField";
import { Avatar, Button, Card, Typography } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  logOut,
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

  const loggedInUser = useAppSelector(selectUsername);
  const firstname = useAppSelector(selectFirstname);
  const lastname = useAppSelector(selectLastname);
  const balance = useAppSelector(selectBalance);

  //user password local component state
  const [pass, setPass] = useState("");
  //user local component state
  const [user, setUser] = useState("");
  //fetched password local component state
  const [_fetchedPass, setFetchedPass] = useState<FetchedUserPass>();
  //get users password from neo4j
  const [getHash] = useLazyQuery(GET_HASH, {
    fetchPolicy: "network-only",
    onCompleted: (result) => {
      setFetchedPass(result);
    },
    onError: (error) => {
      console.log(JSON.stringify(error, null, 2));
    },
  });

  // Init login part 1
  function initLogin() {
    if (user && pass)
      getHash({ variables: { where: { username: user.toLowerCase() } } });
    else toggleAlert(true, "Need username and pass", "error");
  }

  // Login part 2 init on user password fetched from neo4j
  useEffect(() => {
    // If not inital declaration
    if (_fetchedPass) {
      // If username matched in db
      if (_fetchedPass.users.length > 0) {
        // If password matches hash from db
        if (LoginUtils.verifyHash(pass, _fetchedPass.users[0].password)) {
          // Set global state to logged in
          localStorage.setItem("userLoggedIn", user.toLowerCase());
          dispatch(setUsername(user.toLowerCase()));
          getUserDetails({
            variables: { where: { username: user.toLowerCase() } },
          });
          toggleAlert(false);
        } else {
          toggleAlert(true, "Wrong password or username", "error");
        }
      } else {
        toggleAlert(true, "Wrong password or username", "error");
      }
    }
  }, [_fetchedPass]);

  const [getUserDetails] = useLazyQuery(GET_USER, {
    fetchPolicy: "network-only",
    onCompleted: (res: any) => {
      let userDetails: UserDetails = res.users[0];
      dispatch(
        setUserDetails({
          username: userDetails.username,
          balance: userDetails.balance,
          firstname: userDetails.firstname,
          lastname: userDetails.lastname,
        })
      );
    },
    onError: (error) => {
      console.log(JSON.stringify(error, null, 2));
    },
  });
  // Function for logging out user. Removes all data stored on client side
  function onClickLogOut() {
    localStorage.removeItem("userLoggedIn");
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
              <Avatar sx={{ bgcolor: deepPurple[500] }}>
                {firstname.charAt(0)}
                {lastname == "" ? firstname.charAt(1) : lastname.charAt(0)}
              </Avatar>
              {loggedInUser}
            Fornavn: {firstname}
            Etternavn: {lastname}
            Saldo: {balance}
          </div>
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
              <b> Log out </b>
            </Button>
          </div>
        </>
      ) : (
        // if user not logged in, display log in page
        <>
          <div className="login">
            <div>
              <h1>Log into your user here</h1>
              <div className="login-fields">
                <TextField
                  id="login-username"
                  className=""
                  label="Username"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
                <TextField
                  id="login-password"
                  type={"password"}
                  label="Password"
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
                  <b> Log in </b>
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
                  <b>Not a user? click here</b>
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
