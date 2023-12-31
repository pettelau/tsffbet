import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
} from "@mui/material";
import { Stats, OptionStake } from "../../types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

import { selectPath } from "../../redux/envSlice";
import NoAccess from "../NoAccess";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function BettingStats() {
  const url_path = useAppSelector(selectPath);

  const [responseCode, setResponseCode] = useState<number>();

  const [responseText, setResponseText] = useState<number>();
  const [stats, setStats] = useState<Stats>();

  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(15);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showOnlyFuture, setShowOnlyFuture] = useState<boolean>(false);

  const fetchStats = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${url_path}api/stats?offset=${offset}&limit=${limit}&onlyfuture=${showOnlyFuture}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      }
    );
    const resp = await response.json();
    setResponseCode(response.status);

    if (response.ok) {
      setIsLoading(false);
      setStats((prevStats) => {
        if (!prevStats) return resp;

        return {
          ...prevStats,
          total_stakes: [...prevStats.total_stakes, ...resp.total_stakes],
        };
      });
    } else {
      setIsLoading(false);
      setResponseCode(response.status);
      setResponseText(resp.detail);
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyFuture(event.target.checked);
  };

  const showOnlyFutureRef = useRef(showOnlyFuture);

  // useEffect(() => {
  //   fetchStats();
  // }, [offset]);

  // useEffect(() => {
  //   setStats((prevStats) => {
  //     if (!prevStats) return undefined;

  //     return {
  //       ...prevStats,
  //       total_stakes: [],
  //     };
  //   });
  //   setOffset(0);
  // }, [showOnlyFuture]);

  useEffect(() => {
    // Check if showOnlyFuture has changed
    if (showOnlyFuture !== showOnlyFutureRef.current) {
      // Reset stats and offset
      setStats((prevStats) => {
        if (!prevStats) return undefined;

        return {
          ...prevStats,
          total_stakes: [],
        };
      });
      if (offset === 0) {
        fetchStats();
      } else {
        setOffset(0);
      }

      // Update the ref to the new value
      showOnlyFutureRef.current = showOnlyFuture;
    } else {
      // Fetch stats
      fetchStats();
    }
  }, [offset, showOnlyFuture]);

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
      <h1>Statistikk for TSFFBet</h1>
      {stats ? (
        <>
          Antall brukere:{" "}
          <Chip
            sx={{ backgroundColor: "white", marginBottom: 0.3 }}
            label={stats.num_users}
            variant="outlined"
          />{" "}
          <br /> <br />
          Gjennomsnittlig balanse per bruker:{" "}
          <Chip
            sx={{ backgroundColor: "white", marginBottom: 0.3 }}
            label={stats.avg_user_balance + " kr"}
            variant="outlined"
          />
          <br /> <br />
          Antall kuponger satt:{" "}
          <Chip
            sx={{ backgroundColor: "white", marginBottom: 0.3 }}
            label={stats.num_accums}
            variant="outlined"
          />{" "}
          <br /> <br />
          Gjennomsnittlig sum per kupong:{" "}
          <Chip
            sx={{ backgroundColor: "white", marginBottom: 0.3 }}
            label={stats.avg_stake + " kr"}
            variant="outlined"
          />{" "}
          <br /> <br />
          <h2>💸Spillene med flest plasserte kronasjer💸</h2>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyFuture}
                onChange={handleSwitchChange}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label="Vis bare kommende spill"
          />
          <div className="table-div-stats">
            <Table aria-label="simple table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "white" }}>
                  <TableCell align="center">
                    <b>Spill</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Utfall</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Total sum</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>ant. spill</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.total_stakes.map(
                  (option: OptionStake, index: number) => {
                    return (
                      <TableRow
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "white" : "gainsboro",
                        }}
                      >
                        <TableCell sx={{ padding: 1 }}>
                          {option.title}
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          {option.option}
                        </TableCell>
                        <TableCell align="center">
                          <b>{option.total_stake.toLocaleString()} kr</b>
                        </TableCell>
                        <TableCell align="center">
                          {option.number_accums}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </div>
          {isLoading ? (
            <>
              <br />
              <br />
              <br />
              <CircularProgress />
            </>
          ) : (
            <>
              <br />
              <Button
                onClick={() => {
                  setOffset((prev) => prev + limit);
                }}
                variant="contained"
              >
                Last inn flere
              </Button>
              <br />
              <br />
            </>
          )}
        </>
      ) : (
        ""
      )}
    </>
  );
}
