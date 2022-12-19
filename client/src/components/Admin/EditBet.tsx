import React, { useEffect } from "react";
import {
  AlertColor,
  Button,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { selectAdmin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import NoAccess from "../NoAccess";
import { AlertT, Bet, NewBetType, NewOptionType } from "../../types";
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

  const [allBets, setAllBets] = React.useState<Bet[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [chosenCategory, setChosenCategory] =
    React.useState<string>("Alle kategorier");

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const fetchBets = async () => {
    const response = await fetch(`${url_path}api/admin/allbets`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setAllBets(resp);
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
      toggleAlert(true, "Bettet ble settled!", "success");
    } else {
      toggleAlert(true, resp["errorMsg"], "error");
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
      toggleAlert(true, "Bettet ble akseptert!", "success");
    } else {
      toggleAlert(true, resp["errorMsg"], "error");
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
      toggleAlert(true, "Bettet ble stengt!", "success");
    } else {
      toggleAlert(true, resp["errorMsg"], "error");
    }
  }

  return (
    <>
      {/* Alert component to show error/success messages */}
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      <h2>Alle bets</h2>
      {isAdmin ? (
        <>
          {allBets.map((bet: Bet, betindex) => {
            return (
              <>
                <Accordion
                  sx={{ backgroundColor: BET_STATUS_COLOR[bet.bet_status - 1] }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {bet.title} - {bet.bet_status}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
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
                            {option.option} - {option.latest_odds} - Status:{" "}
                            {option.option_status}
                            <Select
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
                          </div>
                        </>
                      );
                    })}
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
                    <Button
                      variant="contained"
                      onClick={() => {
                        closeBet(betindex);
                      }}
                    >
                      Steng spill
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </>
            );
          })}
        </>
      ) : (
        ""
      )}
    </>
  );
}
