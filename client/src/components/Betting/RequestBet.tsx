import React, { useEffect } from "react";
import {
  AlertColor,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
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
import {
  AlertT,
  Bet,
  BetOption,
  MatchSimple,
  NewBetType,
  NewOptionType,
} from "../../types";
import AlertComp from "../Alert";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { flexbox } from "@mui/system";

export default function RequestBet() {
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

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [title, setTitle] = React.useState<string>("Scorer mål: ");
  const [category, setCategory] = React.useState<Category>("Målscorer");
  const [closeDate, setCloseDate] = React.useState<Dayjs | null>(
    dayjs().add(7, "day")
  );

  const [options, setOptions] = React.useState<NewOptionType[]>([
    { option: "Ja", latest_odds: null },
    { option: "Nei", latest_odds: null },
  ]);

  const [bets, setBets] = React.useState<Bet[]>([]);

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

  async function fetchExistingReqs() {
    const response = await fetch(`${url_path}api/requestedbets`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setBets(resp);
    } else {
      setResponseText(resp.detail);
    }
  }

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

  useEffect(() => {
    fetchExistingReqs();
  }, []);

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

  async function sendRequest() {
    if (closeDate == null) {
      toggleAlert(
        true,
        "Du må legge inn en forventet stengetid for bettet. Bare sett denne langt fram i tid om du ikke vet",
        "error"
      );
      return;
    }
    if (options.length == 0) {
      toggleAlert(true, "Du må ha minst ett spillalternativ", "error");
      return;
    }
    if (!options.every((option) => option.latest_odds !== null)) {
      toggleAlert(true, "Alle alternativene må ha en odds", "error");
      return;
    }
    if (title == "" && category !== "Resultat") {
      toggleAlert(true, "Du må skrive inn en beskrivelse av bettet", "error");
      return;
    }
    let bet_obj: NewBetType = {
      title:
        title !== ""
          ? title
          : `${chosenMatch?.home_team} - ${chosenMatch?.away_team}`,
      category: category,
      close_date: closeDate.toDate(),
      related_match: chosenMatch?.match_id,
      options: options,
    };
    const response = await fetch(`${url_path}api/requestbet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(bet_obj),
    });

    const resp = await response.json();
    if (response.ok) {
      fetchExistingReqs();
      toggleAlert(true, "Bettet ble requestet!", "success");
      setOptions([]);
      setTitle("");
    } else {
      toggleAlert(true, resp["errorMsg"], "error");
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
      setTitle("");
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
      setTitle("Totalt antall mål i kampen");
    } else if (chosenMatch && category === "Målscorer") {
      const defaultOptions: NewOptionType[] = [
        { option: "Ja", latest_odds: null },
        { option: "Nei", latest_odds: null },
      ];
      setOptions(defaultOptions);
      setTitle("Scorer mål: ");
    } else if (chosenMatch) {
      setTitle("");
      setOptions([
        { option: "", latest_odds: null },
        { option: "", latest_odds: null },
      ]);
    } else {
      setTitle("");
      setOptions([
        { option: "", latest_odds: null },
        { option: "", latest_odds: null },
      ]);
      setCloseDate(dayjs().add(7, "day"));
    }
  }, [chosenMatch, category]);

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
      {/* Alert component to show error/success messages */}

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
        <>
          <h2>Request et bet</h2>
          <FormControl size="small" sx={{ width: 400 }} variant="outlined">
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
          <FormControl size="small" sx={{ width: 400 }} variant="outlined">
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
          <h3>Alternativ:</h3>
          {options.map((option: NewOptionType, index: number) => {
            return (
              <>
                <TextField
                  sx={{ width: 200 }}
                  size="small"
                  label="Bet option"
                  value={option.option}
                  onChange={(e) => updateOption(e.target.value, index)}
                />
                <TextField
                  sx={{ width: 100 }}
                  size="small"
                  type={"number"}
                  label="Odds"
                  value={option.latest_odds}
                  onChange={(e) => updateOdds(e.target.value, index)}
                />
                <IconButton
                  onClick={() => {
                    removeOption(index);
                  }}
                >
                  <DeleteForeverIcon sx={{ fontSize: 30 }} />
                </IconButton>
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
            <b>
              Tilbakebetalingsprosent:{" "}
              {((totalodds / options.length / options.length) * 100).toFixed(1)}
              %
            </b>
            <br /> (Denne bør være opp mot 100%, men som oftest ikke over)
          </div>
          <br />
          <Button
            variant="outlined"
            onClick={() => {
              sendRequest();
            }}
          >
            Request Bet
          </Button>
          <br />
          <br />
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <AlertComp
              setAlert={setAlert}
              _alert={_alert}
              _alertType={_alertType}
              toggleAlert={toggleAlert}
            ></AlertComp>
          </div>
        </>
      </div>

      <Divider />
      <br />
      {bets.length > 0 ? (
        <>
          <h3>Venter på godkjenning fra TSFFBet:</h3>
          <div className="bet-flex-container">
            {bets.map((bet: Bet) => {
              return (
                <>
                  <div>
                    <Card sx={{ padding: 2 }}>
                      <>
                        {bet.title} <br />
                        Innsendt av: <b>{bet.submitter}</b>
                        <br />
                        {bet.bet_options.map((option: BetOption) => {
                          return (
                            <>
                              <Button
                                disabled={true}
                                variant={"contained"}
                                sx={{
                                  m: 1,
                                  mt: 1,
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
            })}
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
}
