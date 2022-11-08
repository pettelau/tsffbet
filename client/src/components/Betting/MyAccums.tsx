import { useQuery } from "@apollo/client";
import { Button, Card } from "@mui/material";
import React from "react";
import { GET_ACCUMS } from "../../queries";
import { Accums } from "../../types";

export default function MyAccums() {
  const [accums, setAccums] = React.useState<Accums[]>([]);
  const { loading, error, data } = useQuery(GET_ACCUMS, {
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      setAccums(data.accums);
      console.log(data);
    },
  });
  if (loading) {
    return <>Laster dine kuponger...</>;
  }
  return (
    <>
      {accums.map((accum) => {
        return (
          <>
            <Card sx={{ maxWidth: 345 }}>
              Accum ID: {accum.accum_id} <br />
              {accum.bet_optionsConnection.edges.map((bet) => {
                return (
                  <>
                    <b>{bet.node.bet.category}</b> <br />
                    {bet.node.bet.title} <br />
                    {bet.node.option} - {bet.user_odds}
                    <br />
                  </>
                );
              })}
              Stake: {accum.stake} <br />
              Totalodds: {accum.total_odds.toFixed(2)} <br />
              Potensiell utbetaling: {(accum.stake * accum.total_odds).toFixed(2)}kr
              <br />
            </Card>
            <br></br>
          </>
        );
      })}
    </>
  );
}
