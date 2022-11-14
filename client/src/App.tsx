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
import { setUsername } from "./redux/userSlice";
import BettingHome from "./components/Betting/BettingHome";
import MyAccums from "./components/Betting/MyAccums";
import Accumulator from "./components/Betting/Accumulator";
import Login from "./components/Login";
import UserReg from "./components/UserReg";
import BettingAdmin from "./components/Betting/BettingAdmin";

export default function App() {
  
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="bettinghome" element={<BettingHome />} />
            <Route path="bettingmyaccums" element={<MyAccums />} />
            <Route path="Login" element={<Login />} />
            <Route path="UserReg" element={<UserReg />} />
            <Route path="bettingAdmin" element={<BettingAdmin />} />
          </Routes>
        </Router>
        <Accumulator />
      </div>
    </Provider>
  );
}