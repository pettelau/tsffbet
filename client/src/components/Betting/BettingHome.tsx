import { useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { useEffect } from "react";
import { Bet, BetOption } from "../../types";
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

  const [bets, setBets] = React.useState<Bet[]>([]);

  const [categories, setCategories] = React.useState<string[]>([]);
  const [chosenCategory, setChosenCategory] =
    React.useState<string>("Alle kategorier");
  const accumBets = useAppSelector(selectAccum);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const fetchBets = async () => {
    const response = await fetch(`${url_path}api/openbets`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    console.log(resp);
    setResponseCode(response.status);
    if (response.status == 200) {
      setBets(resp);
      console.log(resp);
      let cats: string[] = ["Alle kategorier"];
      resp.forEach((bet: Bet) => {
        if (cats.indexOf(bet.category) === -1) {
          cats.push(bet.category);
        }
      });
      setCategories(cats);
    } else {
      setResponseText(resp.detail);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  function addToAccum(bet: string, option: BetOption, index: number) {
    if (index == -1) {
      dispatch(addBet({ bet: bet, option: option }));
    } else {
      dispatch(removeBet({ bet: bet, option: option }));
    }
  }
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    console.log(newValue);
    setChosenCategory(newValue);
  };
  if (responseCode !== 200) {
    return <NoAccess responseCode={responseCode} responseText={responseText} />;
  }
  return (
    <>
      <div>
        <Tabs
          sx={{
            boxShadow: "3px 3px 5px 2px rgba(0,0,0,.1)",
            backgroundColor: "white",
            margin: 2,
          }}
          value={chosenCategory}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat: string) => {
            return <Tab label={cat} value={cat} />;
          })}
        </Tabs>
        <div className="bet-flex-container">
          {bets.map((bet: Bet) => {
            console.log(new Date(bet.close_time));

            if (
              chosenCategory == "Alle kategorier" ||
              chosenCategory == bet.category
            ) {
              return (
                <>
                  <div>
                    <Card sx={{ padding: 2 }}>
                      <>
                        {bet.title} <br />
                        Bettet stenger {new Date(
                          bet.close_time
                        ).getDate()}.{" "}
                        {MONTHS[new Date(bet.close_time).getMonth()]}{" "}
                        {new Date(bet.close_time).getFullYear()} kl.{" "}
                        {("0" + new Date(bet.close_time).getHours()).slice(-2)}:
                        {("0" + new Date(bet.close_time).getMinutes()).slice(
                          -2
                        )}
                        <br />
                        {bet.bet_options.map((option: BetOption) => {
                          let index = accumBets
                            .map((c: any) => c.option.option_id)
                            .indexOf(option.option_id);
                          return (
                            <>
                              <Button
                                variant={index == -1 ? "outlined" : "contained"}
                                // variant="contained"
                                onClick={() => {
                                  addToAccum(bet.title, option, index);
                                }}
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
                                {option.option} - {option.latest_odds}
                              </Button>
                            </>
                          );
                        })}
                      </>
                    </Card>
                  </div>
                </>
              );
            }
          })}
        </div>
      </div>
    </>
  );
}
