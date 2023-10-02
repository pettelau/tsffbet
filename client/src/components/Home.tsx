import { Alert, AlertTitle, Button, Divider, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LoginUtils } from "../utils";
// Icons

import LocalAtmIcon from "@mui/icons-material/LocalAtm";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import ForumIcon from "@mui/icons-material/Forum";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import QuizIcon from "@mui/icons-material/Quiz";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div>
        <h1>Velkommen til TSFFBet!</h1>
        <div
          style={{
            marginLeft: 10,
            marginRight: 10,
            maxWidth: 500,
            display: "grid",
            margin: "auto",
            textAlign: "center",
          }}
        >
          <Alert severity="info">
            <AlertTitle>Kom med innspill!</AlertTitle>
            Nå har det blitt en god del spill på siden, og noen har virkelig
            fått en snøballeffekt (creds til blant annet mafioso og Thalles),
            mens noen er blakke. Jeg ønsker at det skal være mulig for alle å
            spille videre, og kanskje minimere forskjellene litt i
            "konkurransen". Har du noen gode idéer til hvordan vi kan oppnå
            dette? Send meg en melding på 906 36 538! Tar imot alle forslag med
            takk 😁
          </Alert>
          <br />
          {/* <Alert severity="warning">
            <AlertTitle>Innmelding av odds</AlertTitle>Foreløpig har jeg ikke noe
            godt system for innmelding av resultater fra bets, f.eks. målscorer-
            og kortspill som ikke ligger ute på tsff.no. Inntil videre kan dere
            sende SMS til 90636538 med resultater. Her stoler jeg på at det dere
            melder inn er korrekt.
          </Alert> */}
          <br />
          Studentfotballen tar stadig nye steg, og jeg følte det nå var på tide
          med en helt egen bettingside for TSFF! <br />
          <br />
          Her kan du opprette en egen bruker og lage klinke bonger som du kan
          sette dine fiktive penger på!
        </div>
        <br />
        <div className="flex-container">
          <div>
            <LocalAtmIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Odds</h3>
            Oddssiden inneholder alt av tilgjengelige odds på markedet.
          </div>
          <div>
            <LockPersonIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Innlogging</h3>
            Du må opprette bruker og bli godkjent av meg før du kan se noe på
            siden. Du kan også legge til hvilket lag du er tilknyttet. Passordet
            blir selvsagt hashet både på klient- og serversiden, men anbefaler
            uansett å bruke et helt ufarlig passord.
          </div>

          <div>
            <DynamicFeedIcon sx={{ fontSize: 80 }} /> <br />
            <h3>BetFeed</h3>
            Sjekk hvilke bonger de andre brukere har levert inn!
          </div>
          <div>
            <ScheduleSendIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Request-a-bet</h3>
            Dersom du ønsker å foreslå et bet som bør inn på TSFFBet kan du
            gjøre dette. Det kan være kamper som mangler eller andre spill som
            f.eks. målscorerspill, cornerspill, over-/underspill. Jeg godtar det
            meste!
          </div>
          <div>
            <LeaderboardIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Leaderboard</h3>
            Sjekk hvem som har har mest cash på TSFFBet, og hvem som har flest
            grønne bonger i portefølgen sin.
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}
