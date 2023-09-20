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
            <AlertTitle>Nyheter på siden</AlertTitle>
            <b>- Resultater: </b>Under fanen "Resultater" finner du tidligere
            kamper med historiske odds, tabell for de to avdelingene samt en
            oversikt over sluttspillsfordelingene "AS IT STANDS" i de to
            avdelingene!
            <br />
            <br />
            <b>- Oddssiden: </b>Oddssiden er nå strukturert på kommende kamper,
            og kampoddsene ser du ved siden av lagnavnene. Dersom det finnes
            tilhørende odds til kampen, får du disse opp ved å trykke på kampen.
            <br />
            <br />
            <b>- Enklere bet requests: </b>Nå kan (og bør) du knytte odds du
            foreslår til en kommende kamp. I tillegg velger du kategori blant
            noen forhåndsdefinerte kategorier. Da blir ting forhåpentligvis litt
            mer strukturert og oversiktlig for alle.
          </Alert>
          <br />
          <Alert severity="warning">
            <AlertTitle>Innmelding av odds</AlertTitle>Foreløpig har jeg ikke noe
            godt system for innmelding av resultater fra bets, f.eks. målscorer-
            og kortspill som ikke ligger ute på tsff.no. Inntil videre kan dere
            sende SMS til 90636538 med resultater. Her stoler jeg på at det dere
            melder inn er korrekt.
          </Alert>
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
