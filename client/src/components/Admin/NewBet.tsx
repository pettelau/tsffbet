import React, { useEffect } from "react";
import {
  AlertColor,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { selectAdmin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import NoAccess from "../NoAccess";
import { AlertT, MatchSimple, NewBetType, NewOptionType } from "../../types";
import { SendToMobileTwoTone } from "@mui/icons-material";
import AlertComp from "../Alert";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

export default function NewBet() {
  const url_path = useAppSelector(selectPath);

  type Category =
    | "Resultat"
    | "Målscorer"
    | "Kortspill"
    | "Holde nullen"
    | "Over/under"
    | "Annet";
  const CATEGORIES: Category[] = [
    "Resultat",
    "Målscorer",
    "Kortspill",
    "Holde nullen",
    "Over/under",
    "Annet",
  ];
  const [matches, setMatches] = React.useState<MatchSimple[]>([]);

  const [chosenMatch, setChosenMatch] = React.useState<MatchSimple>();

  const isAdmin = useAppSelector(selectAdmin);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [title, setTitle] = React.useState<string>("");
  const [category, setCategory] = React.useState<Category>("Resultat");
  const [closeDate, setCloseDate] = React.useState<Dayjs | null>(dayjs());

  const [options, setOptions] = React.useState<NewOptionType[]>([
    { option: "", latest_odds: null },
  ]);

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

  const navigate = useNavigate();

  function updateOption(value: string, index: number) {
    let optionsCopy = [...options];
    optionsCopy[index].option = value;
    setOptions(optionsCopy);
  }

  function updateOdds(value: string, index: number) {
    let optionsCopy = [...options];
    if (value) {
      optionsCopy[index].latest_odds = Number(value);
    } else {
      optionsCopy[index].latest_odds = null;
    }
    setOptions(optionsCopy);
  }

  const fetchMatches = async () => {
    const response = await fetch(`${url_path}api/matchessimple`);
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setMatches(resp);
      console.log(resp);
    } else {
      setResponseText(resp.detail);
    }
  };

  async function sendBet() {
    if (closeDate == null) {
      toggleAlert(true, "Must include close date", "error");
    } else {
      let bet_obj: NewBetType = {
        title: title,
        category: category,
        close_date: closeDate.toDate(),
        related_match: chosenMatch?.match_id,
        options: options,
      };
      const response = await fetch(`${url_path}api/admin/createbet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(bet_obj),
      });

      const resp = await response.json();
      if (resp["settleBet"]) {
        toggleAlert(true, "Bettet ble opprettet!", "success");
        setOptions([{ option: "", latest_odds: null }]);
        setTitle("");
        setCategory("Resultat");
      } else {
        toggleAlert(true, resp["errorMsg"], "error");
      }
    }
  }
  
  let totalodds = 0;
  options.forEach((option) => {
    if (typeof option.latest_odds === "number") {
      totalodds += option.latest_odds;
    }
  });

  function removeOption(index: number) {
    let optionsCopy = [...options];
    optionsCopy.splice(index, 1);
    setOptions(optionsCopy);
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (chosenMatch && category === "Resultat") {
      const defaultOptions: NewOptionType[] = [
        {
          latest_odds: null,
          option: chosenMatch.home_team,
        },
        {
          latest_odds: null,
          option: "Uavgjort",
        },
        {
          latest_odds: null,
          option: chosenMatch.away_team,
        },
      ];
      setOptions(defaultOptions);
    } else if (chosenMatch && category === "Holde nullen") {
      const defaultOptions: NewOptionType[] = [
        {
          latest_odds: null,
          option: `${chosenMatch.home_team} - JA`,
        },
        {
          latest_odds: null,
          option: `${chosenMatch.home_team} - NEI`,
        },
        {
          latest_odds: null,
          option: `${chosenMatch.away_team} - JA`,
        },
        {
          latest_odds: null,
          option: `${chosenMatch.away_team} - NEI`,
        },
      ];
      setOptions(defaultOptions);
      setTitle("Laget holder nullen");
    } else if (chosenMatch && category === "Over/under") {
      const defaultOptions: NewOptionType[] = [
        {
          latest_odds: null,
          option: `Over 0.5`,
        },
        {
          latest_odds: null,
          option: `Under 0.5`,
        },
        {
          latest_odds: null,
          option: `Over 1.5`,
        },
        {
          latest_odds: null,
          option: `Under 1.5`,
        },
        {
          latest_odds: null,
          option: `Over 2.5`,
        },
        {
          latest_odds: null,
          option: `Under 2.5`,
        },
      ];
      setOptions(defaultOptions);
      setTitle("Totalt antall må i kampen");
    }
  }, [chosenMatch, category]);

  return (
    <>
      {/* Alert component to show error/success messages */}
      <AlertComp
        setAlert={setAlert}
        _alert={_alert}
        _alertType={_alertType}
        toggleAlert={toggleAlert}
      ></AlertComp>
      <div
        style={{
          marginTop: 30,
          backgroundColor: "white",
          maxWidth: 800,
          margin: "0 auto",
          paddingTop: 30,
          paddingBottom: 30,
          marginBottom: 50,
        }}
      >
        <h2>Add nytt bet</h2>
        {isAdmin ? (
          <>
            <FormControl sx={{ width: 400 }} variant="outlined">
              <InputLabel id="category-label">Kategori</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                label="Kategori"
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
            <FormControl sx={{ width: 400 }} variant="outlined">
              <InputLabel id="match-label">Match</InputLabel>
              <Select
                labelId="match-label"
                value={chosenMatch?.match_id || "none"}
                onChange={(e) => {
                  const matchId = e.target.value;
                  if (matchId === "none") {
                    setChosenMatch(undefined);
                    setCloseDate(null);
                  } else {
                    const selectedMatch = matches.find(
                      (match) => match.match_id === matchId
                    );
                    setChosenMatch(selectedMatch);
                    if (selectedMatch?.ko_time) {
                      setCloseDate(dayjs(selectedMatch.ko_time));
                    } else {
                      setCloseDate(null);
                    }
                  }
                }}
                label="Match"
              >
                <MenuItem value="none">Ingen tilknyttet kamp</MenuItem>
                {matches.map((match) => (
                  <MenuItem key={match.match_id} value={match.match_id}>
                    {match.home_team} - {match.away_team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
            <TextField
              disabled={category === "Resultat" ? true : false}
              sx={{ width: 400 }}
              label="Beskrivelse av bet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <br />
            <h3>Forventet tidspunkt for spillstopp:</h3>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={closeDate}
                onChange={(newValue) => setCloseDate(newValue)}
                ampm={false}
              />
            </LocalizationProvider>
            <br />
            <br />
            <h3>Options:</h3>
            {options.map((option: NewOptionType, index: number) => {
              return (
                <>
                  <TextField
                    label="Bet option"
                    value={option.option}
                    onChange={(e) => updateOption(e.target.value, index)}
                  />
                  <TextField
                    type={"number"}
                    label="Odds"
                    value={option.latest_odds}
                    onChange={(e) => updateOdds(e.target.value, index)}
                  />
                  <Button
                    onClick={() => {
                      removeOption(index);
                    }}
                    color="error"
                    variant="contained"
                  >
                    X
                  </Button>
                  <br />
                  <br />
                </>
              );
            })}
            <br />
            <Button
              variant="outlined"
              onClick={() => {
                setOptions([...options, { option: "", latest_odds: null }]);
              }}
            >
              Legg til alternativ
            </Button>{" "}
            <br />
            <br />
            <div>
              Tilbakebetalingsprosent:{" "}
              {((totalodds / options.length / options.length) * 100).toFixed(1)}
              %
            </div>
            <br />
            <Button
              variant="outlined"
              onClick={() => {
                sendBet();
              }}
            >
              Send Bet
            </Button>
          </>
        ) : (
          <div>Du er dessverre ikke admin... Spør Lau om du kan bli?</div>
        )}
      </div>
    </>
  );
}
