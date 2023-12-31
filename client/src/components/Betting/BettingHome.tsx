import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { Bet, BetOption, BetWithMatch, Match } from "../../types";
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
import TimelineIcon from "@mui/icons-material/Timeline";
import OddsMovementModal from "./OddsMovement";

export default function BettingHome() {
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

  const { width } = useWindowDimensions();

  const url_path = useAppSelector(selectPath);

  const firstname = useAppSelector(selectFirstname);
  const lastname = useAppSelector(selectLastname);
  const balance = useAppSelector(selectBalance);

  const [matches, setMatches] = React.useState<Match[]>([]);

  const [bets, setBets] = React.useState<Bet[]>([]);
  const [standaloneBets, setStandaloneBets] = React.useState<Bet[]>([]);
  const [matchBets, setMatchBets] = React.useState<BetWithMatch[]>([]);

  const [groups, setGroups] = React.useState<string[]>(["Alle odds"]);

  const [chosenGroup, setChosenGroup] = React.useState<string>("Alle odds");
  const accumBets = useAppSelector(selectAccum);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [expandedAccordions, setExpandedAccordions] = React.useState<number[]>(
    []
  );

  const [selectedBetId, setSelectedBetId] = React.useState<number | null>(null);

  const handleOpenModal = (betId: number) => {
    setSelectedBetId(betId);
  };

  const handleCloseModal = () => {
    setSelectedBetId(null);
  };

  const fetchStandaloneBets = async () => {
    const response = await fetch(`${url_path}api/standalonebets`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setStandaloneBets(resp);
    } else {
      setResponseText(resp.detail);
    }
  };

  const fetchMatches = async () => {
    const response = await fetch(
      `${url_path}api/matcheswithodds?in_future=True&weather=True`
    );
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setMatches(resp);

      let allMatchBets: BetWithMatch[] = [];

      for (let match of resp as Match[]) {
        let matchBetsWithId = match.match_bets.map((bet) => ({
          ...bet,
          match_id: match.match_id,
        }));
        allMatchBets.push(...matchBetsWithId);
      }
      setMatchBets(allMatchBets);

      if (resp.length > 0) {
        let groups: string[] = ["Begge avdelinger"];
        resp.forEach((match: Match) => {
          if (groups.indexOf(match.group_name.toLowerCase()) === -1) {
            groups.push(match.group_name.toLowerCase());
          }
        });
        groups.push("Alle odds");
        setGroups(groups);
        setChosenGroup("Begge avdelinger");
      }
    } else {
      setResponseText(resp.detail);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchStandaloneBets();
  }, []);

  function addToAccum(
    bet: string,
    option: BetOption,
    index: number,
    match_id: number | undefined
  ) {
    if (index == -1) {
      dispatch(addBet({ bet: bet, option: option, match_id }));
    } else {
      dispatch(removeBet({ bet: bet, option: option, match_id }));
    }
  }

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setChosenGroup(newValue);
  };

  function formatDate(dateString: Date) {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("default", options).format(
      new Date(dateString)
    );
  }

  // Custom sorting function
  function sortOptions(
    optionA: BetOption,
    optionB: BetOption,
    home: string,
    away: string
  ): number {
    const order = [home, "Uavgjort", away];
    return order.indexOf(optionA.option) - order.indexOf(optionB.option);
  }

  const toggleAccordion = (matchId: number) => {
    if (expandedAccordions.includes(matchId)) {
      setExpandedAccordions((prev) => prev.filter((id) => id !== matchId));
    } else {
      setExpandedAccordions((prev) => [...prev, matchId]);
    }
  };

  function PlaceholderIcon() {
    return <Box width={24} height={24} bgcolor="transparent" />;
  }

  const formatOdds = (odds: number): string => {
    // If odds are 10 or greater, return the whole number
    if (odds >= 10) {
      return odds.toFixed(0);
    }

    // If odds have 2 decimals, return with 2 decimals
    if (Math.floor(odds * 100) % 10 !== 0) {
      return odds.toFixed(2);
    }

    // Otherwise, return with 1 decimal
    return odds.toFixed(1);
  };

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
        {matches.length > 0 || standaloneBets.length > 0 ? (
          <>
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
              {groups.flatMap((group: string, index: number) => {
                if (index === groups.length - 1) {
                  return [
                    <Divider orientation="vertical" flexItem />,
                    <Tab label={group} value={group} />,
                  ];
                }
                return [<Tab label={group} value={group} />];
              })}
            </Tabs>
          </>
        ) : (
          <>
            <br />
            Ingen odds ute for øyeblikket
          </>
        )}

        <div className="match-accordions">
          {chosenGroup !== "Alle odds" && matches.length > 0 ? (
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
            if (
              chosenGroup == "Begge avdelinger" ||
              chosenGroup == match.group_name.toLowerCase()
            ) {
              const isExpandable = match.match_bets.some(
                (bet) => bet.category !== "Resultat"
              );
              return (
                <>
                  <Accordion
                    key={match.match_id}
                    expanded={
                      isExpandable &&
                      expandedAccordions.includes(match.match_id)
                    }
                    onChange={() => toggleAccordion(match.match_id)}
                  >
                    <AccordionSummary
                      style={{ cursor: isExpandable ? "pointer" : "auto" }}
                      expandIcon={
                        isExpandable ? <ExpandMoreIcon /> : PlaceholderIcon()
                      }
                    >
                      <Box display="flex" flexDirection="column" width="100%">
                        {/* Date part for small screens */}
                        <Box
                          display={{ xs: "block", sm: "none" }} // Display on small screens only
                          mb={1} // Margin bottom for spacing
                        >
                          <div
                            style={{
                              margin: "0 auto",
                              fontSize: "smaller",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <>
                              {match.ko_time ? (
                                <>
                                  {new Date(match.ko_time).getDate()}.{" "}
                                  {MONTHS[
                                    new Date(match.ko_time).getMonth()
                                  ].slice(0, 3)}{" "}
                                  {new Date(match.ko_time).getFullYear()} kl.{" "}
                                  {(
                                    "0" + new Date(match.ko_time).getHours()
                                  ).slice(-2)}
                                  :
                                  {(
                                    "0" + new Date(match.ko_time).getMinutes()
                                  ).slice(-2)}
                                </>
                              ) : (
                                "N/A"
                              )}
                              {match.weather ? (
                                <>
                                  {" |"}
                                  <img
                                    style={{
                                      height: 20,
                                      marginRight: 4,
                                      marginLeft: 8,
                                    }}
                                    src={`/weather-icon/${match.weather.weather_icon}.svg`}
                                  ></img>
                                  {match.weather.air_temperature.toFixed(0)}°
                                  {" • "}
                                  {match.weather.precipitation} mm{" • "}
                                  {match.weather.wind_speed.toFixed(0)} m/s
                                </>
                              ) : (
                                ""
                              )}
                            </>
                          </div>
                        </Box>

                        {/* Main content */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          {/* Date and Teams */}
                          <Box display="flex" alignItems="center">
                            {/* Date for larger screens */}
                            <Box
                              sx={{ width: 110 }}
                              display={{ xs: "none", sm: "flex" }} // Display on larger screens only
                              mr={2} // Margin right for spacing
                              flexDirection="column"
                              alignItems="flex-start"
                            >
                              {match.weather ? (
                                <>
                                  <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "clip",
                                    }}
                                  >
                                    {match.ko_time
                                      ? formatDate(match.ko_time)
                                      : "N/A"}
                                  </span>
                                  <span
                                    style={{
                                      height: 24,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "clip",
                                      display: "flex",
                                      alignItems: "center",
                                      fontSize: "smaller",
                                    }}
                                  >
                                    <>
                                      <img
                                        style={{ height: 20, marginRight: 4 }}
                                        src={`/weather-icon/${match.weather.weather_icon}.svg`}
                                      ></img>
                                      {match.weather.air_temperature.toFixed(0)}
                                      °{" • "}
                                      {match.weather.precipitation} mm{" • "}
                                      {match.weather.wind_speed.toFixed(0)} m/s
                                    </>
                                  </span>
                                </>
                              ) : (
                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "clip",
                                  }}
                                >
                                  {match.ko_time
                                    ? formatDate(match.ko_time)
                                    : "N/A"}
                                </span>
                              )}
                            </Box>
                            <Box
                              id="teams-odds"
                              display="flex"
                              flexDirection="column"
                              alignItems="flex-start"
                            >
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "clip",
                                }}
                              >
                                {match.home_team}
                              </span>
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {match.away_team}
                              </span>
                            </Box>
                          </Box>
                          {/* Odds */}
                          <Box display="flex">
                            {match.match_bets
                              .filter((bet: Bet) => bet.category === "Resultat")
                              .map((bet: Bet) => {
                                return (
                                  <>
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(bet.bet_id);
                                      }}
                                      onFocus={(e) => e.stopPropagation()}
                                    >
                                      <TimelineIcon />
                                    </IconButton>
                                    {bet.bet_options
                                      .sort((optionA, optionB) =>
                                        sortOptions(
                                          optionA,
                                          optionB,
                                          match.home_team,
                                          match.away_team
                                        )
                                      )
                                      .map((option: BetOption) => {
                                        let index = accumBets
                                          .map((c: any) => c.option.option_id)
                                          .indexOf(option.option_id);
                                        return (
                                          <Button
                                            id="odds-button"
                                            size="small"
                                            key={option.option_id}
                                            variant={
                                              index == -1
                                                ? "outlined"
                                                : "contained"
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addToAccum(
                                                bet.title,
                                                option,
                                                index,
                                                match.match_id
                                              );
                                            }}
                                            onFocus={(e) => e.stopPropagation()}
                                            sx={{
                                              m: 1,
                                              mt: 1,
                                              ":hover": {
                                                color: "#ffffff",
                                                backgroundColor: "#1d2528",
                                                borderColor: "#1d2528",
                                              },
                                            }}
                                          >
                                            {formatOdds(option.latest_odds)}
                                          </Button>
                                        );
                                      })}
                                  </>
                                );
                              })}
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {match.match_bets
                        .filter((bet: Bet) => bet.category !== "Resultat")
                        .map((bet: Bet) => {
                          return (
                            <>
                              <Card
                                sx={{
                                  padding: 2,
                                  marginBottom: 2,
                                  backgroundColor: "#c8e6ff",
                                }}
                              >
                                <>
                                  <b>{bet.title}</b>
                                  <IconButton
                                    sx={{ height: 20, marginLeft: 0.3 }}
                                    onClick={() => handleOpenModal(bet.bet_id)}
                                  >
                                    <TimelineIcon />
                                  </IconButton>
                                  <br />
                                  <p
                                    style={{
                                      marginTop: 1,
                                      marginBottom: 1,
                                      color: "#828385",
                                    }}
                                  >
                                    Bettet stenger{" "}
                                    {new Date(bet.close_timestamp).getDate()}.{" "}
                                    {
                                      MONTHS[
                                        new Date(bet.close_timestamp).getMonth()
                                      ]
                                    }{" "}
                                    {new Date(
                                      bet.close_timestamp
                                    ).getFullYear()}{" "}
                                    kl.{" "}
                                    {(
                                      "0" +
                                      new Date(bet.close_timestamp).getHours()
                                    ).slice(-2)}
                                    :
                                    {(
                                      "0" +
                                      new Date(bet.close_timestamp).getMinutes()
                                    ).slice(-2)}
                                  </p>
                                  <p
                                    style={{
                                      marginTop: 1,
                                      marginBottom: 1,
                                      color: "#828385",
                                    }}
                                  >
                                    {bet.category}
                                  </p>

                                  {bet.bet_options.map((option: BetOption) => {
                                    let index = accumBets
                                      .map((c: any) => c.option.option_id)
                                      .indexOf(option.option_id);
                                    return (
                                      <>
                                        <Button
                                          variant={
                                            index === -1
                                              ? "outlined"
                                              : "contained"
                                          }
                                          // variant="contained"
                                          onClick={() => {
                                            addToAccum(
                                              bet.title,
                                              option,
                                              index,
                                              match.match_id
                                            );
                                          }}
                                          sx={{
                                            m: 1,
                                            mt: 1,
                                            backgroundColor:
                                              index === -1 ? "white" : "",
                                            ":hover": {
                                              color: "#ffffff",
                                              backgroundColor: "#1d2528",
                                              borderColor: "#1d2528",
                                            },
                                          }}
                                        >
                                          {option.option} - {option.latest_odds}
                                        </Button>
                                      </>
                                    );
                                  })}
                                </>
                              </Card>
                            </>
                          );
                        })}
                    </AccordionDetails>
                  </Accordion>
                </>
              );
            }
          })}
          {chosenGroup === "Alle odds" ? (
            <>
              {standaloneBets.map((bet: Bet) => {
                return (
                  <>
                    <Card
                      sx={{
                        padding: 2,
                        marginBottom: 2,
                        backgroundColor: "white",
                      }}
                    >
                      <>
                        <b>{bet.title}</b>
                        <br />
                        <p
                          style={{
                            marginTop: 1,
                            marginBottom: 1,
                            color: "#828385",
                          }}
                        >
                          Bettet stenger{" "}
                          {new Date(bet.close_timestamp).getDate()}.{" "}
                          {MONTHS[new Date(bet.close_timestamp).getMonth()]}{" "}
                          {new Date(bet.close_timestamp).getFullYear()} kl.{" "}
                          {(
                            "0" + new Date(bet.close_timestamp).getHours()
                          ).slice(-2)}
                          :
                          {(
                            "0" + new Date(bet.close_timestamp).getMinutes()
                          ).slice(-2)}
                        </p>
                        <p
                          style={{
                            marginTop: 1,
                            marginBottom: 1,
                            color: "#828385",
                          }}
                        >
                          {bet.category}
                        </p>
                        {bet.bet_options.map((option: BetOption) => {
                          let index = accumBets
                            .map((c: any) => c.option.option_id)
                            .indexOf(option.option_id);
                          return (
                            <>
                              <Button
                                variant={index == -1 ? "outlined" : "contained"}
                                onClick={() => {
                                  addToAccum(
                                    bet.title,
                                    option,
                                    index,
                                    undefined
                                  );
                                }}
                                sx={{
                                  m: 1,
                                  mt: 1,
                                  backgroundColor: index === -1 ? "white" : "",
                                  ":hover": {
                                    color: "#ffffff",
                                    backgroundColor: "#1d2528",
                                    borderColor: "#1d2528",
                                  },
                                }}
                              >
                                {option.option} - {option.latest_odds}
                              </Button>
                            </>
                          );
                        })}
                      </>
                    </Card>
                  </>
                );
              })}
              {matchBets.map((bet: BetWithMatch) => {
                return (
                  <>
                    <Card
                      sx={{
                        padding: 2,
                        marginBottom: 2,
                        backgroundColor: "white",
                      }}
                    >
                      <>
                        <b>{bet.title}</b>
                        <br />
                        <p
                          style={{
                            marginTop: 1,
                            marginBottom: 1,
                            color: "#828385",
                          }}
                        >
                          Bettet stenger{" "}
                          {new Date(bet.close_timestamp).getDate()}.{" "}
                          {MONTHS[new Date(bet.close_timestamp).getMonth()]}{" "}
                          {new Date(bet.close_timestamp).getFullYear()} kl.{" "}
                          {(
                            "0" + new Date(bet.close_timestamp).getHours()
                          ).slice(-2)}
                          :
                          {(
                            "0" + new Date(bet.close_timestamp).getMinutes()
                          ).slice(-2)}
                        </p>
                        <p
                          style={{
                            marginTop: 1,
                            marginBottom: 1,
                            color: "#828385",
                          }}
                        >
                          {bet.category}
                        </p>
                        {bet.bet_options.map((option: BetOption) => {
                          let index = accumBets
                            .map((c: any) => c.option.option_id)
                            .indexOf(option.option_id);
                          return (
                            <>
                              <Button
                                variant={index == -1 ? "outlined" : "contained"}
                                onClick={() => {
                                  addToAccum(
                                    bet.title,
                                    option,
                                    index,
                                    bet.match_id
                                  );
                                }}
                                sx={{
                                  m: 1,
                                  mt: 1,
                                  backgroundColor: index === -1 ? "white" : "",
                                  ":hover": {
                                    color: "#ffffff",
                                    backgroundColor: "#1d2528",
                                    borderColor: "#1d2528",
                                  },
                                }}
                              >
                                {option.option} - {option.latest_odds}
                              </Button>
                            </>
                          );
                        })}
                      </>
                    </Card>
                  </>
                );
              })}
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      {selectedBetId && (
        <OddsMovementModal
          betId={selectedBetId}
          open={selectedBetId !== null ? true : false}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
