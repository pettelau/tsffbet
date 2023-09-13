import { Alert, Button, Divider, TextField } from "@mui/material";
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
        <h1>Velkommen til nye LauBet!</h1>
        <div
          style={{
            maxWidth: 500,
            display: "grid",
            margin: "auto",
            textAlign: "center",
          }}
        >
          <Alert
            sx={{ ":hover": { cursor: "pointer" } }}
            onClick={() => {
              navigate("/competition");
            }}
            severity="info"
          >
            Klikk på denne meldingen for å gå til den nye betting-konkurransen
            for å lese reglene og melde deg på!!
          </Alert>
        </div>
        <br />
        <h3>En oversikt over nye og gamle funksjoner:</h3>
        <div className="flex-container">
          <div>
            <LocalAtmIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Odds</h3>
            Oddssiden er selve kjernefunksjonen til LauBet, og den finnes
            selvfølgelig fortsatt!
          </div>
          <div>
            <LockPersonIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Innlogging</h3>
            LauBet har et nytt brukersystem hvor dere oppretter egne brukere, og
            blir whitelistet av meg. All informasjon på LauBet er utilgjengelig
            for alle andre.
          </div>
          <div>
            <MenuBookIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Ordboka</h3>
            Ordboka er er et viktig verktøy for å ta vare på våre særegne ord og
            uttrykk.
          </div>
          <div>
            <DynamicFeedIcon sx={{ fontSize: 80 }} /> <br />
            <h3>BetFeed</h3>
            Sjekk hvilke bonger de andre spillerne har levert inn!
          </div>
          <div>
            <ScheduleSendIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Request-a-bet</h3>
            Dersom du ønsker å foreslå et bet som bør inn på LauBet er dette
            fortsatt mulig.
          </div>
          <div>
            <LeaderboardIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Leaderboard</h3>
            Sjekk hvem som har har mest cash på LauBet, og hvem som har flest
            grønne bonger i portefølgen sin.
          </div>
          <div>
            <ForumIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Kommentarer (kommer)</h3>
            Er en odds helt feilsatt? Har noen satt et helt håpløst bet som
            viser at de har null tro på deg i eksempelvis Padeltennis eller på
            byen? Legg igjen en kommentar og si din mening!
          </div>

          <div>
            <SportsTennisIcon sx={{ fontSize: 80 }} /> <br />
            <h3>Interne bets (kommer)</h3>
            Sett opp interne veddemål med én eller flere andre brukere og
            plasser LauCoins på at du selv kommer til å vinne. F.eks. et slag
            padeltennis eller FIFA.
          </div>
          {/* <div>
            <QuizIcon sx={{ fontSize: 80 }} /> <br />
            <h3>TopicDuel (kommer kanskje)</h3>
            Min gode venn Jacob Theisen jobber for tiden med et quiz-spill hvor
            man spiller live mot én eller flere venner i en gitt kategori. Dette
            er noe vi håper vi kan få implementert inn i LauBet etter hvert...
          </div> */}
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}
