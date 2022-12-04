import React from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
// import Login from "./components/Login";
import NavBar from "./components/Nav";
// import UserReg from "./components/UserReg";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useEffect } from "react";
import { setUserDetails, setUsername } from "./redux/userSlice";
import BettingHome from "./components/Betting/BettingHome";
import MyAccums from "./components/Betting/MyAccums";
import Accumulator from "./components/Betting/Accumulator";
import Login from "./components/Login";
import UserReg from "./components/UserReg";
import BettingAdmin from "./components/Betting/BettingAdmin";
import AppAppBar from "./components/AppAppBar";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { selectPath } from "./redux/envSlice";

const THEME = createTheme({
  typography: {
    fontFamily: `'Quicksand', sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#303c6c",
          color: "white",
        },
        outlined: {
          borderColor: "#303c6c",
          border: "2px solid",
          color: "#303c6c",
        },
      },
    },
  },
});

export default function App() {
  const url_path = "http://localhost:8000/";

  async function loginDetails() {
    const response = await fetch(`${url_path}api/login/details`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    console.log(resp);
    // dispatch(setUsername(user.toLowerCase()));
    store.dispatch(setUserDetails(resp[0]));
  }

  useEffect(() => {
    if (localStorage.getItem("jwt") !== "") {
      loginDetails();
    }
  }, []);
  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      <Provider store={store}>
        <div className="App">
          <Router>
            <AppAppBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="bettinghome" element={<BettingHome />} />
              <Route path="myaccums" element={<MyAccums />} />
              <Route path="login" element={<Login />} />
              <Route path="userReg" element={<UserReg />} />
              <Route path="bettingAdmin" element={<BettingAdmin />} />
            </Routes>
          </Router>
          <Accumulator />
        </div>
      </Provider>
    </ThemeProvider>
  );
}
