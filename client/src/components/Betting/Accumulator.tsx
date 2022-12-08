import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import accumSlice, {
  selectAccum,
  removeAccum,
  removeBet,
} from "../../redux/accumSlice";
import { AccumBetOption } from "../../types";
import {
  Button,
  Chip,
  IconButton,
  Input,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_ACCUM } from "../../queries";
import {
  setBalance,
  selectBalance,
  selectUsername,
} from "../../redux/userSlice";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { selectPath } from "../../redux/envSlice";

export default function Accumulator() {
  const dispatch = useAppDispatch();

  const username = useAppSelector(selectUsername);

  const [stake, setStake] = React.useState<string>();
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const bets = useAppSelector(selectAccum);
  const balance = useAppSelector(selectBalance);

  const [betCompleted, setBetCompleted] = React.useState<boolean>(false);

  // const [createAccum] = useMutation(CREATE_ACCUM, {
  //   onCompleted: (res) => {
  //     setBetCompleted(true);
  //   },
  // });

  let totalodds = 1;
  bets.map((bet: AccumBetOption) => {
    totalodds = totalodds * bet.option.latest_odds;
  });
  const url_path = useAppSelector(selectPath);

  console.log(totalodds);

  if (bets.length == 0) {
    return <></>;
  }

  async function createAccum() {
    let bet_packet: any = { bets: bets, stake: stake, totalodds: totalodds };
    console.log(JSON.stringify(bet_packet));
    const response = await fetch(`${url_path}api/placebet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(bet_packet),
    });

    const resp = await response.json();
    if (resp["placeBet"]) {
      let new_balance = balance - Number(stake);
      dispatch(setBalance(new_balance));

      setBetCompleted(true);
    } else {
      toggleAlert(true, resp["errorMsg"], "error");
    }
  }

  if (betCompleted) {
    return (
      <>
        <div className="Accum">
          <div style={{ padding: 20 }}>
            Spillet ditt ble satt! <br />
            <br />
            <Button
              variant="contained"
              onClick={() => {
                afterAccumPlaced(true);
              }}
            >
              Behold valg
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                afterAccumPlaced(false);
              }}
            >
              Lukk
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Handle button click after accum is placed
  function afterAccumPlaced(keep: boolean) {
    setBetCompleted(false);
    setStake("");
    if (!keep) dispatch(removeAccum());
  }

  return (
    <>
      {console.log("hei")}
      <div className="Accum">
        {!isCollapsed ? (
          <>
            <div style={{ padding: "20px" }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setIsCollapsed(true);
                }}
              >
                Vis mindre
              </Button>
              <br />
              <br />
              {bets.map((bet: AccumBetOption) => {
                return (
                  <>
                    <Paper sx={{ padding: 1 }} elevation={3}>
                      <div>
                        <b>{bet.bet}</b>
                        <br />

                        <Chip
                          sx={{ backgroundColor: "" }}
                          label={
                            bet.option.option + " - " + bet.option.latest_odds
                          }
                          variant="outlined"
                        />
                        <IconButton
                          onClick={() => {
                            dispatch(removeBet(bet));
                          }}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </div>
                    </Paper>
                    <br />
                  </>
                );
              })}
              <TextField
                error={balance < Number(stake) ? true : false}
                helperText={
                  balance < Number(stake)
                    ? "Innsats overstiger din balanse"
                    : ""
                }
                value={stake}
                type="number"
                onChange={(e) => {
                  setStake(e.target.value);
                }}
                id="outlined-basic"
                label="Innsats"
                variant="outlined"
              />{" "}
              <br />
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <Chip
                  sx={{ backgroundColor: "white" }}
                  label={"Totalodds: " + totalodds.toFixed(2)}
                ></Chip>
              </div>
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                <Chip
                  sx={{ backgroundColor: "#388e3c", color: "white" }}
                  label={
                    "Mulig utbetaling: " +
                    (totalodds * Number(stake ? stake : 0)).toLocaleString() +
                    " NOK"
                  }
                ></Chip>
              </div>
              <Button
                disabled={balance < Number(stake) ? true : false}
                variant="contained"
                onClick={() => {
                  createAccum();
                }}
              >
                Sett spill
              </Button>
            </div>
          </>
        ) : (
          <div style={{ padding: "20px" }}>
            <Button
              sx={{}}
              size="small"
              variant="contained"
              onClick={() => {
                setIsCollapsed(false);
              }}
            >
              Vis mer
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
function toggleAlert(arg0: boolean, arg1: any, arg2: string) {
  throw new Error("Function not implemented.");
}
