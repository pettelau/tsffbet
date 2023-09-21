import React, { useEffect } from "react";
import {
  Alert,
  AlertColor,
  Button,
  Checkbox,
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
} from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { selectAdmin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import NoAccess from "../NoAccess";
import {
  AlertT,
  Bet,
  BetAdmin,
  MatchSimple,
  NewBetType,
  NewOptionType,
} from "../../types";
import { SendToMobileTwoTone } from "@mui/icons-material";
import AlertComp from "../Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function EditBet() {
  const url_path = useAppSelector(selectPath);

  const isAdmin = useAppSelector(selectAdmin);

  //error toggle
  const [_alert, setAlert] = React.useState<boolean>(false);
  const [_alertType, setAlertType] = React.useState<AlertT>({
    type: "info",
    msg: "",
  });
  // Toggle error with message
  function toggleAlert(
    isActive: boolean,
    msg: string = "",
    type: AlertColor = "info"
  ) {
    setAlert(isActive);
    setAlertType({ type: type, msg: msg });
  }

  const [allBets, setAllBets] = React.useState<BetAdmin[]>([]);

  const [matches, setMatches] = React.useState<MatchSimple[]>([]);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<string>();

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);

  const [offset, setOffset] = React.useState<number>(0);
  const [limit, setLimit] = React.useState<number>(15);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const fetchBets = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${url_path}api/admin/allbets?skip=${offset}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      }
    );
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setIsLoading(false);
      console.log(resp);
      setAllBets((prevBets) => [...prevBets, ...resp]);
    } else {
      setResponseCode(response.status);
      setResponseText(response.statusText);
      setOpenErrorSnackbar(true);
    }
  };

  const fetchMatches = async () => {
    const response = await fetch(`${url_path}api/matchessimple`);
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setMatches(resp);
    } else {
      setResponseCode(response.status);
      setResponseText(response.statusText);
      setOpenErrorSnackbar(true);
    }
  };

  useEffect(() => {
    fetchBets();
    fetchMatches();
  }, [offset]);

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

  const BET_STATUS_COLOR = ["white", "gainsboro"];
  const OPTION_STATUS_COLOR = ["white", "green", "tomato"];
  const OPTION_STATUS = ["open", "won", "lost"];

  const handleOptionChange = (
    event: any,
    betindex: number,
    optionindex: number
  ) => {
    let oldValue = [...allBets];
    oldValue[betindex].bet_options[optionindex].option_status = event;
    setAllBets(oldValue);
  };

  const handleOptionOddsChange = (
    event: string,
    betindex: number,
    optionindex: number
  ) => {
    let oldValue = [...allBets];
    if (event) {
      oldValue[betindex].bet_options[optionindex].latest_odds = Number(event);
    } else {
      oldValue[betindex].bet_options[optionindex].latest_odds = null;
    }
    setAllBets(oldValue);
  };

  async function settleBet(betindex: number) {
    let bet = allBets[betindex];
    const response = await fetch(`${url_path}api/admin/settlebet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(bet),
    });

    const resp = await response.json();
    if (resp["settleBet"]) {
      setOpenSuccessSnackbar(true);
    } else {
      setResponseCode(response.status);
      setResponseText(response.statusText);
      setOpenErrorSnackbar(true);
    }
  }

  async function acceptBet(betindex: number) {
    let bet_id = { bet_id: allBets[betindex]["bet_id"] };
    const response = await fetch(`${url_path}api/admin/acceptbet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(bet_id),
    });

    const resp = await response.json();
    if (response.ok) {
      setOpenSuccessSnackbar(true);
    } else {
      setResponseCode(response.status);
      setResponseText(response.statusText);
      setOpenErrorSnackbar(true);
    }
  }

  async function closeBet(betindex: number) {
    let bet_id = { bet_id: allBets[betindex]["bet_id"] };

    const response = await fetch(`${url_path}api/admin/closebet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(bet_id),
    });

    const resp = await response.json();
    if (response.ok) {
      setOpenSuccessSnackbar(true);
    } else {
      setResponseCode(response.status);
      setResponseText(response.statusText);
      setOpenErrorSnackbar(true);
    }
  }

  async function updateRelatedMatch(
    bet_id: number,
    match_id: number | undefined
  ) {
    if (match_id === undefined) {
      return;
    }
    let payload = { bet_id: bet_id, match_id: match_id };

    const response = await fetch(`${url_path}api/admin/updaterelatedmatch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(payload),
    });

    const resp = await response.json();
    if (response.ok) {
      setOpenSuccessSnackbar(true);
    } else {
      setResponseCode(response.status);
      setResponseText(response.statusText);
      setOpenErrorSnackbar(true);
    }
  }

  async function updateOrAddOption(
    betindex: number,
    optionindex: number,
    option_id: number,
    bet_id: number
  ) {
    let option = allBets[betindex].bet_options[optionindex];
    if (option_id !== -1) {
      const response = await fetch(`${url_path}api/admin/updateoption`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(option),
      });

      const resp = await response.json();
      if (response.ok) {
        setOpenSuccessSnackbar(true);
      } else {
        setResponseCode(response.status);
        setResponseText(response.statusText);
        setOpenErrorSnackbar(true);
      }
    } else {
      let newOption = {
        option: option["option"],
        latest_odds: option["latest_odds"],
        bet: bet_id,
      };
      const response = await fetch(`${url_path}api/admin/addoption`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(newOption),
      });

      const resp = await response.json();
      if (response.ok) {
        setOpenSuccessSnackbar(true);
      } else {
        setResponseCode(response.status);
        setResponseText(response.statusText);
        setOpenErrorSnackbar(true);
      }
    }
  }

  function addOption(betindex: number) {
    let oldValue = [...allBets];
    oldValue[betindex].bet_options.push({
      option_id: -1,
      option_status: 1,
      option: "",
      latest_odds: 1,
    });
    setAllBets(oldValue);
  }

  return (
    <>
      {/* Alert component to show error/success messages */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSuccessSnackbar(false)}
      >
        <Alert onClose={() => setOpenSuccessSnackbar(false)} severity="success">
          Bettet ble oppdatert!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenErrorSnackbar(false)}
      >
        <Alert onClose={() => setOpenErrorSnackbar(false)} severity="error">
          Noe galt skjedde: {responseCode}: {responseText}
        </Alert>
      </Snackbar>
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      <h2>Alle bets</h2>
      {isAdmin ? (
        <>
          {allBets.map((bet: BetAdmin, betindex) => {
            let totalprobability = 0;
            bet.bet_options.forEach((option) => {
              if (typeof option.latest_odds === "number") {
                totalprobability += 1 / option.latest_odds;
              }
            });
            return (
              <>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                  <Accordion
                    sx={{
                      backgroundColor: BET_STATUS_COLOR[bet.bet_status - 1],
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{bet.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Select
                        sx={{ width: 200 }}
                        value={bet.related_match || ""}
                        onChange={(e) => {
                          const newRelatedMatch = e.target.value as number | "";
                          setAllBets((prevBets: BetAdmin[]) =>
                            prevBets.map((b) =>
                              b.bet_id === bet.bet_id
                                ? {
                                    ...b,
                                    related_match:
                                      newRelatedMatch === ""
                                        ? undefined
                                        : newRelatedMatch,
                                  }
                                : b
                            )
                          );
                        }}
                      >
                        <MenuItem value="">
                          <em>Ingen</em>
                        </MenuItem>
                        {matches.map((match) => (
                          <MenuItem key={match.match_id} value={match.match_id}>
                            {`${match.home_team} vs ${match.away_team}`}
                          </MenuItem>
                        ))}
                      </Select>{" "}
                      <br />
                      <Button
                        disabled={bet.related_match === null ? true : false}
                        variant="contained"
                        onClick={() => {
                          updateRelatedMatch(bet.bet_id, bet.related_match);
                        }}
                      >
                        Oppdater tilknyttet kamp
                      </Button>
                      {bet.bet_options.map((option, optionindex) => {
                        return (
                          <>
                            <div
                              style={{
                                padding: 5,
                                backgroundColor:
                                  OPTION_STATUS_COLOR[option.option_status - 1],
                              }}
                            >
                              <TextField
                                label="Option text"
                                value={option.option}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setAllBets((prevBets) =>
                                    prevBets.map((b, idx) =>
                                      idx === betindex
                                        ? {
                                            ...b,
                                            bet_options: b.bet_options.map(
                                              (opt, optIdx) =>
                                                optIdx === optionindex
                                                  ? { ...opt, option: newValue }
                                                  : opt
                                            ),
                                          }
                                        : b
                                    )
                                  );
                                }}
                              />
                              <TextField
                                sx={{ width: 80 }}
                                type={"number"}
                                label="Option odds"
                                value={option.latest_odds}
                                onChange={(e) =>
                                  handleOptionOddsChange(
                                    e.target.value,
                                    betindex,
                                    optionindex
                                  )
                                }
                              />
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  updateOrAddOption(
                                    betindex,
                                    optionindex,
                                    option.option_id,
                                    bet.bet_id
                                  );
                                }}
                              >
                                {option.option_id == -1
                                  ? "Legg til"
                                  : "Oppdater"}
                              </Button>
                              <Select
                                size="small"
                                value={option.option_status}
                                label="Age"
                                onChange={(e) => {
                                  handleOptionChange(
                                    e.target.value,
                                    betindex,
                                    optionindex
                                  );
                                }}
                              >
                                <MenuItem value={1}>Open</MenuItem>
                                <MenuItem value={2}>Won</MenuItem>
                                <MenuItem value={3}>Lost</MenuItem>
                              </Select>
                              <br />
                            </div>
                          </>
                        );
                      })}
                      <Button
                        onClick={() => {
                          addOption(betindex);
                        }}
                      >
                        Legg til option
                      </Button>
                      <br />
                      Tilbakebetaling:{" "}
                      {totalprobability > 0
                        ? ((1 / totalprobability) * 100).toFixed(1)
                        : "N/A"}
                      %
                      <br />
                      <br />
                      <Button
                        variant="contained"
                        onClick={() => {
                          settleBet(betindex);
                        }}
                      >
                        Settle bet! (Irreversible)
                      </Button>
                      <br />
                      {bet.is_accepted ? (
                        ""
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => {
                              acceptBet(betindex);
                            }}
                          >
                            Aksepter spill
                          </Button>
                        </>
                      )}
                      {new Date(bet.close_timestamp) > new Date() &&
                      bet.closed_early === null ? (
                        <Button
                          variant="contained"
                          onClick={() => {
                            closeBet(betindex);
                          }}
                        >
                          Steng spill
                        </Button>
                      ) : (
                        ""
                      )}
                    </AccordionDetails>
                  </Accordion>
                </div>
              </>
            );
          })}
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
