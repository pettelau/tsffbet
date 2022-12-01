import { useQuery } from "@apollo/client";
import { Button, Card } from "@mui/material";
import React, { useEffect } from "react";
import { GET_ACCUMS } from "../../queries";
import { selectPath } from "../../redux/envSlice";
import { useAppSelector } from "../../redux/hooks";
import { Accums } from "../../types";

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

  useEffect(() => {
    fetchBets();
  }, []);
  return (
    <>
      {accums.map((accum) => {
        return (
          <>
            <Card sx={{ maxWidth: 345 }}>
              Accum ID: {accum.accum_id} <br />
              <br />
              {accum.accumBets.map((bet) => {
                return (
                  <>
                    {bet.bet} <br />
                    {bet.chosen_option} - {bet.user_odds}
                    <br />
                    Status: {bet.option_status}
                    <br />
                    <br />
                  </>
                );
              })}
              Stake: {accum.stake} <br />
              Totalodds: {accum.total_odds.toFixed(2)} <br />
              Potensiell utbetaling:{" "}
              {(accum.stake * accum.total_odds).toFixed(2)}kr <br />
              <br />
            </Card>
            <br></br>
          </>
        );
      })}
    </>
  );
}
