import { useQuery } from "@apollo/client";
import { Button, Card, Chip, Divider, Paper, Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { GET_ACCUMS } from "../../queries";
import { selectPath } from "../../redux/envSlice";
import { useAppSelector } from "../../redux/hooks";
import { AccumBets, Accums } from "../../types";

function getAccumStatus(accum: Accums) {
  let hasWon: boolean = false;
  let hasLost: boolean = false;
  let hasOpen: boolean = false;
  accum.accumBets.forEach((bet: AccumBets) => {
    if (bet.option_status == 3) {
      hasLost = true;
      return;
    } else if (bet.option_status == 2) {
      hasWon = true;
    } else if (bet.option_status == 1) {
      hasOpen = true;
    }
  });
  if (hasLost) {
    return ["#a81a3f", 3];
  }
  if (hasOpen) {
    return ["white", 1];
  }
  if (hasWon) {
    return ["#388e3c", 2];
  } else {
    return ["white", 1];
  }
}

export default function MyAccums() {
  const [accums, setAccums] = React.useState<Accums[]>([]);
  const fetchBets = async () => {
    const response = await fetch(`${url_path}api/accums`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    setAccums(resp);
    console.log(resp);
  };
  const url_path = useAppSelector(selectPath);

  const [chosenAccums, setChosenAccums] = React.useState<number>(0);

  const ACCUMCHOICES = [
    { label: "Alle kuponger", id: 0 },
    { label: "Levende", id: 1 },
    { label: "Avsluttede", id: 5 },
    { label: "Vunnede", id: 2 },
    { label: "Tapte", id: 3 },
  ];

  useEffect(() => {
    fetchBets();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setChosenAccums(newValue);
  };

  return (
    <>
      <h2>Mine kuponger</h2>
      <Tabs
        sx={{
          boxShadow: "3px 3px 5px 2px rgba(0,0,0,.1)",
          backgroundColor: "white",
          margin: 2,
        }}
        value={chosenAccums}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {ACCUMCHOICES.map((choice: any) => {
          return <Tab label={choice.label} value={choice.id} />;
        })}
      </Tabs>
      <div className="accums-flex-container">
        {accums.map((accum) => {
          let status: (string | number)[] = getAccumStatus(accum);
          if (
            chosenAccums == 0 ||
            chosenAccums == status[1] ||
            (chosenAccums == 5 && (status[1] == 2 || status[1] == 3))
          ) {
            return (
              <>
                <div>
                  <Card
                    sx={{ backgroundColor: status[0], padding: 1, width: 345 }}
                  >
                    <Chip
                      sx={{
                        backgroundColor: "#d6d6d6",
                        color: "black",
                        marginRight: 1,
                      }}
                      label={"Kupong ID: " + accum.accum_id}
                    ></Chip>
                    <br />
                    {accum.accumBets.map((bet) => {
                      let border = "";
                      let status_color = "white";
                      let text_color = "black";
                      if (bet.option_status == 2) {
                        border = "2px solid #388e3c";
                        status_color = "#388e3c";
                        text_color = "white";
                      } else if (bet.option_status == 3) {
                        border = "2px solid #a81a3f";
                        status_color = "#a81a3f";
                        text_color = "white";
                      }
                      return (
                        <>
                          <Paper
                            sx={{
                              border: border,
                              padding: 1,
                              marginLeft: 2,
                              marginRight: 2,
                              marginTop: 1,
                              marginBottom: 2,
                            }}
                            elevation={3}
                          >
                            <b>{bet.bet} </b>
                            <br />
                            <Chip
                              sx={{
                                backgroundColor: status_color,
                                color: text_color,
                              }}
                              label={bet.chosen_option + " - " + bet.user_odds}
                            ></Chip>

                            <br />
                          </Paper>
                        </>
                      );
                    })}
                    <Chip
                      sx={{
                        backgroundColor: "#303c6c",
                        color: "white",
                        marginRight: 1,
                      }}
                      label={"Innsats: " + accum.stake + "kr"}
                    ></Chip>
                    <Chip
                      sx={{ backgroundColor: "#303c6c", color: "white" }}
                      label={"Totalodds: " + accum.total_odds.toFixed(2)}
                    ></Chip>
                    <br />
                    <Chip
                      sx={{
                        marginTop: 1,
                        backgroundColor: "#303c6c",
                        color: "white",
                      }}
                      label={
                        "Mulig utbetaling: " +
                        (accum.stake * accum.total_odds).toFixed(2) +
                        " kr"
                      }
                    ></Chip>
                  </Card>
                </div>
              </>
            );
          }
        })}
      </div>
    </>
  );
}
