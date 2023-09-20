import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
} from "@mui/material";
import React from "react";
import { Bet, BetOption, Match } from "../../types";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppSelector } from "../../redux/hooks";
import { selectAccum } from "../../redux/accumSlice";

export default function MatchAccordion({
  match,
}: {
  match: Match;
}) {
  const accumBets = useAppSelector(selectAccum);

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

  const [expandedAccordions, setExpandedAccordions] = React.useState<number[]>(
    []
  );

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

  const isExpandable = match.match_bets.some(
    (bet) => bet.category !== "Resultat"
  );

  return (
    <>
      <Accordion
        key={match.match_id}
        expanded={isExpandable && expandedAccordions.includes(match.match_id)}
        onChange={() => toggleAccordion(match.match_id)}
      >
        <AccordionSummary
          style={{ cursor: isExpandable ? "pointer" : "auto" }}
          expandIcon={isExpandable ? <ExpandMoreIcon /> : PlaceholderIcon()}
        >
          <Box display="flex" flexDirection="column" width="100%">
            {/* Date part for small screens */}
            <Box
              display={{ xs: "block", sm: "none" }} // Display on small screens only
              mb={1} // Margin bottom for spacing
            >
              {match.ko_time ? (
                <>
                  <div style={{ fontSize: "small" }}>
                    {new Date(match.ko_time).getDate()}.{" "}
                    {MONTHS[new Date(match.ko_time).getMonth()]}{" "}
                    {new Date(match.ko_time).getFullYear()} kl.{" "}
                    {("0" + new Date(match.ko_time).getHours()).slice(-2)}:
                    {("0" + new Date(match.ko_time).getMinutes()).slice(-2)}
                  </div>
                </>
              ) : (
                "N/A"
              )}
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
                  display={{ xs: "none", sm: "block" }} // Display on larger screens only
                  mr={2} // Margin right for spacing
                >
                  {match.ko_time ? formatDate(match.ko_time) : "N/A"}
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
                    <b>{match?.home_goals}</b> {match.home_team}
                  </span>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <b>{match?.away_goals}</b> {match.away_team}
                  </span>
                </Box>
              </Box>
              {/* Odds */}
              <Box display="flex">
                {match.match_bets
                  .filter((bet: Bet) => bet.category === "Resultat")
                  .map((bet: Bet) =>
                    bet.bet_options
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
                            disabled
                            id="odds-button"
                            size="small"
                            key={option.option_id}
                            variant={index == -1 ? "outlined" : "contained"}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onFocus={(e) => e.stopPropagation()}
                            sx={{
                              backgroundColor:
                                option.option_status === 2 ? "#8aff7e" : "",
                              m: 1,
                              mt: 1,
                              ":hover": {
                                color: "#ffffff",
                                backgroundColor: "#1d2528",
                                borderColor: "#1d2528",
                              },
                            }}
                          >
                            {option.latest_odds.toFixed(1)}
                          </Button>
                        );
                      })
                  )}
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
                      <br />
                      <p
                        style={{
                          marginTop: 1,
                          marginBottom: 1,
                          color: "#828385",
                        }}
                      >
                        Bettet stenger {new Date(bet.close_timestamp).getDate()}
                        . {MONTHS[new Date(bet.close_timestamp).getMonth()]}{" "}
                        {new Date(bet.close_timestamp).getFullYear()} kl.{" "}
                        {("0" + new Date(bet.close_timestamp).getHours()).slice(
                          -2
                        )}
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
                              disabled
                              variant={index == -1 ? "outlined" : "contained"}
                              onClick={() => {}}
                              sx={{
                                backgroundColor:
                                  option.option_status === 2
                                    ? "#8aff7e"
                                    : "white",
                                m: 1,
                                mt: 1,
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
