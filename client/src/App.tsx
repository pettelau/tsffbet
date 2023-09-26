import React from "react";
import "./App.css";
import "./index.css"
// import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
import AppAppBar from "./components/AppAppBar";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { selectPath } from "./redux/envSlice";
import AdminHome from "./components/Admin/AdminHome";
import NewBet from "./components/Admin/NewBet";
import EditBet from "./components/Admin/EditBet";
import RequestBet from "./components/Betting/RequestBet";
import Leaderboard from "./components/Betting/Leaderboard";
import BetFeed from "./components/Betting/BetFeed";
import UserProfile from "./components/UserProfile";
import BettingStats from "./components/Betting/BettingStats";
import NewMatch from "./components/Admin/NewMatch";
import Matches from "./components/Betting/Matches";
import EditMatches from "./components/Admin/EditMatches";
import TeamMatches from "./components/Betting/TeamMatches";
import HomeNew from "./components/HomeNew";
import NavBarTW from "./components/NavBarTW";
import ExampleNav from "./components/NavBarTW";

const THEME = createTheme({
  typography: {
    fontFamily: `'Inter var', sans-serif`,
    fontSize: 13,
    fontWeightLight: 250,
    fontWeightRegular: 300,
    fontWeightMedium: 350,
    fontWeightBold: 500
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#13252b",
          color: "white",
          "&.Mui-disabled": {
            opacity: 0.8,
          },
        },
        outlined: {
          borderColor: "#13252b",
          border: "2px solid",
          color: "#13252b",
        },
      },
      variants: [
        {
          props: { variant: "contained", disabled: true },
          style: {
            opacity: 1, // Adjust the opacity value as needed
          },
        },
        {
          props: { variant: "outlined", disabled: true },
          style: {
            opacity: 1,
          },
        },
      ],
    },
  },
});

export default function App() {
  // const url_path = "/";
  const url_path = "http://localhost:8001/";

  async function loginDetails() {
    const response = await fetch(`${url_path}api/login/details`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    // dispatch(setUsername(user.toLowerCase()));
    store.dispatch(setUserDetails(resp));
  }

  useEffect(() => {
    if (localStorage.getItem("jwt") !== null) {
      loginDetails();
    }
  }, []);
  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      <Provider store={store}>
        <div className="App">
          <BrowserRouter>
            {/* <AppAppBar /> */}
            <ExampleNav />
            <Routes>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/" element={<HomeNew />} />
              <Route path="odds" element={<BettingHome />} />
              <Route path="resultater" element={<Matches />} />
              <Route path="resultater/:team" element={<TeamMatches />} />
              <Route path="minekuponger" element={<MyAccums />} />
              <Route path="logginn" element={<Login />} />
              <Route path="brukerreg" element={<UserReg />} />
              <Route path="request" element={<RequestBet />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="betfeed" element={<BetFeed />} />
              <Route path="stats" element={<BettingStats />} />
              <Route path="bruker/:username" element={<UserProfile />} />
              <Route path="admin" element={<AdminHome />} />
              <Route path="admin/nyttbet" element={<NewBet />} />
              <Route path="admin/nymatch" element={<NewMatch />} />
              <Route path="admin/endrematcher" element={<EditMatches />} />
              <Route path="admin/endrebets" element={<EditBet />} />
            </Routes>
          </BrowserRouter>
          <Accumulator />
        </div>
      </Provider>
    </ThemeProvider>
  );
}
