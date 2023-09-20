import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { Bet, BetOption, Match } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addBet, removeBet, selectAccum } from "../../redux/accumSlice";
import {
  selectBalance,
  selectFirstname,
  selectLastname,
} from "../../redux/userSlice";
import { selectPath } from "../../redux/envSlice";
import useWindowDimensions from "../../utils/deviceSizeInfo";
import NoAccess from "../NoAccess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { generateLeagueTable } from "../../utils/generateTable";
import { AsItStands, LeagueTable } from "../../utils/leagueTable";
import MatchAccordion from "./MatchComp";

export default function Matches() {
  const dispatch = useAppDispatch();

  const MONTHS = [
    "januar",
    "februar",
    "mars",
    "april",
    "mai",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "desember",
  ];

  const url_path = useAppSelector(selectPath);

  const [matches, setMatches] = React.useState<Match[]>([]);

  const [bets, setBets] = React.useState<Bet[]>([]);

  // const [categories, setCategories] = React.useState<string[]>([]);

  const [groups, setGroups] = React.useState<string[]>([
    "Avd. A tabell",
    "Avd. B tabell",
    "Sluttspill as it stands",
    "Alle kamper",
    "Avd. A kamper",
    "Avd. B kamper",
  ]);

  const [chosenGroup, setChosenGroup] = React.useState<string>("Avd. A tabell");
  const accumBets = useAppSelector(selectAccum);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  // Separate matches based on group name
  const groupAMatches = matches.filter(
    (match) => match.group_name === "Avdeling A"
  );
  const groupBMatches = matches.filter(
    (match) => match.group_name === "Avdeling B"
  );

  const groupAtable = generateLeagueTable(groupAMatches);
  const groupBtable = generateLeagueTable(groupBMatches);

  const fullTable = [
    ...groupAtable.slice(0, 3),
    ...groupBtable.slice(0, 3),
    ...groupAtable.slice(3, 6),
    ...groupBtable.slice(3, 6),
    ...groupAtable.slice(6, 9),
    ...groupBtable.slice(6, 9),
    ...groupAtable.slice(9, 12),
    ...groupBtable.slice(9, 12),
    ...groupAtable.slice(12),
    ...groupBtable.slice(12),
  ];

  const fetchMatches = async () => {
    const response = await fetch(
      `${url_path}api/matcheswithodds?in_future=False`
    );
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setMatches(resp);
      // let groups: string[] = ["Begge avdelinger"];
      // resp.forEach((match: Match) => {
      //   if (groups.indexOf(match.group_name.toLowerCase()) === -1) {
      //     groups.push(match.group_name.toLowerCase());
      //   }
      // });

      // setGroups(groups);
    } else {
      setResponseText(resp.detail);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setChosenGroup(newValue);
  };

  function shouldShowMatch(group: string) {
    if (chosenGroup === "Alle kamper") {
      return true;
    } else if (
      group.toLowerCase() === "avdeling a" &&
      chosenGroup === "Avd. A kamper"
    ) {
      return true;
    } else if (
      group.toLowerCase() === "avdeling b" &&
      chosenGroup === "Avd. B kamper"
    ) {
      return true;
    } else {
      return false;
    }
  }

  if (responseCode == undefined) {
    return (
      <>
        <br />
        <br />
        <br />
        <CircularProgress />
      </>
    );
  }
  if (responseCode !== 200) {
    return <NoAccess responseCode={responseCode} responseText={responseText} />;
  }

  return (
    <>
      <div style={{ marginBottom: 80 }}>
        {matches.length > 0 ? (
          <>
            {" "}
            <Tabs
              sx={{
                boxShadow: "3px 3px 5px 2px rgba(0,0,0,.1)",
                backgroundColor: "white",
                margin: 2,
              }}
              value={chosenGroup}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {groups.map((group: string) => {
                return <Tab label={group} value={group} />;
              })}
            </Tabs>
          </>
        ) : (
          <>
            <br />
            Ingen resultater å vise ...
          </>
        )}

        <div className="match-accordions">
          {["Alle kamper", "Avd. A kamper", "Avd. B kamper"].includes(
            chosenGroup
          ) && matches.length > 0 ? (
            <Box
              id="outer-1x2"
              display="flex"
              justifyContent="flex-end"
              mb={2}
              bgcolor="#f5f5f5"
            >
              {/* Odds */}
              <Box display="flex">
                <Box id="inner-1">
                  <strong>1</strong>
                </Box>
                <Box id="inner-2">
                  <strong>X</strong>
                </Box>
                <Box id="inner-3">
                  <strong>2</strong>
                </Box>
              </Box>
            </Box>
          ) : (
            ""
          )}

          {matches.map((match: Match) => {
            if (shouldShowMatch(match.group_name)) {
              return (
                <>
                  <MatchAccordion match={match} />
                </>
              );
            }
          })}
          {chosenGroup.toLowerCase() === "avd. a tabell" ? (
            <>
              <Alert
                sx={{ width: "95%", maxWidth: 500, margin: "0 auto" }}
                severity="info"
              >
                Klikk på et lag for å se spilte og kommende kamper
              </Alert>
              <LeagueTable groupName="Avdeling A" tableData={groupAtable} />
            </>
          ) : chosenGroup.toLowerCase() === "avd. b tabell" ? (
            <>
              <Alert
                sx={{
                  width: "95%",
                  maxWidth: 500,
                  margin: "0 auto",
                }}
                severity="info"
              >
                Klikk på et lag for å se spilte og kommende kamper
              </Alert>
              <LeagueTable groupName="Avdeling B" tableData={groupBtable} />
            </>
          ) : chosenGroup.toLowerCase() === "sluttspill as it stands" ? (
            <AsItStands tableData={fullTable} />
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}
