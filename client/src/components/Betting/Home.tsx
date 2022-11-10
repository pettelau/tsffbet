import { useQuery } from "@apollo/client";
import { Button } from "@mui/material";
import React from "react";
import { GET_BETS } from "../../queries";
import { Bet, BetOption } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addBet, removeBet, selectAccum } from "../../redux/accumSlice";
import { selectBalance, selectFirstname, selectLastname } from "../../redux/userSlice";

export default function BettingHome() {
  const dispatch = useAppDispatch();

  const firstname = useAppSelector(selectFirstname);
  const lastname = useAppSelector(selectLastname);
  const balance = useAppSelector(selectBalance);
  console.log(firstname);

  const [bets, setBets] = React.useState<Bet[]>([]);
  const accumBets = useAppSelector(selectAccum);

  //TODO: choose category
  //TODO: add only alive bets to query option (status 1)

  const { loading, error, data } = useQuery(GET_BETS, {
    onCompleted: (data: any) => {
      console.log(data);
      setBets(data.bets);
    },
  });

  if (loading) {
    return <>Loading...</>;
  }

  function addToAccum(bet: string, option: BetOption, index: number) {
    if (index == -1) {
      dispatch(addBet({ bet: bet, option: option }));
    } else {
      dispatch(removeBet({ bet: bet, option: option }));
    }
  }

  return (
    <>
      {bets.map((bet: Bet) => {
        return (
          <>
            Bet ID: {bet.bet_id} <br />
            Bet: {bet.title} <br />
            {bet.bet_options.map((option: BetOption) => {
              let index = accumBets
                .map((c) => c.option.option_id)
                .indexOf(option.option_id);
              return (
                <>
                  <Button
                    variant={index == -1 ? "outlined" : "contained"}
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
            <br />
            <br />
          </>
        );
      })}
    </>
  );
}
