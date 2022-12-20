import {
  AlertColor,
  Button,
  Card,
  Chip,
  Divider,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { selectPath } from "../redux/envSlice";
import { useAppSelector } from "../redux/hooks";
import { AccumBets, Accums, AlertT, DictionaryT } from "../types";
import NoAccess from "./NoAccess";
import Slider from "@mui/material/Slider";
import AlertComp from "./Alert";

const SORT_FILTERS = [
  "Nyeste",
  "Eldste",
  "Hyppighet synkende",
  "Hyppighet stigende",
];

export default function Dictionary() {
  const url_path = useAppSelector(selectPath);

  const [dictionary, setDictinary] = React.useState<DictionaryT[]>([]);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const [persons, setPersons] = React.useState<string[]>([]);
  const [chosenPerson, setChosenPerson] =
    React.useState<string>("Alle bidragsytere");

  const [chosenFilter, setChosenFilter] = React.useState<string>("Nyeste");

  const [word, setWord] = React.useState<string>("");
  const [frequency, setFrequency] = React.useState<number>(5);
  const [description, setDescription] = React.useState<string>("");

  async function fetchDictionary() {
    const response = await fetch(`${url_path}api/dictionary`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });

    const resp = await response.json();
    setResponseCode(response.status);

    if (response.status == 200) {
      setDictinary(resp);
      let persons: string[] = ["Alle bidragsytere"];
      resp.forEach((word: DictionaryT) => {
        if (persons.indexOf(word.submitter.toLowerCase()) === -1) {
          persons.push(word.submitter.toLowerCase());
        }
      });
      setPersons(persons);
    } else {
      setResponseText(resp.detail);
    }
  }

  const handlePersonChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setChosenPerson(newValue);
  };

  const handleFilterChange = (event: string) => {
    let oldValue = [...dictionary];

    if (event == "Nyeste") {
      oldValue.sort((a, b) => (a.word_id < b.word_id ? 1 : -1));
    } else if (event == "Eldste") {
      oldValue.sort((a, b) => (a.word_id > b.word_id ? 1 : -1));
    } else if (event == "Hyppighet synkende") {
      oldValue.sort((a, b) => (a.frequency < b.frequency ? 1 : -1));
    } else {
      oldValue.sort((a, b) => (a.frequency > b.frequency ? 1 : -1));
    }
    setChosenFilter(event);
    setDictinary(oldValue);
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setFrequency(newValue as number);
  };

  async function submitWord() {
    let payload = {
      word: word,
      frequency: frequency,
      description: description,
    };
    const response = await fetch(`${url_path}api/submitword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(payload),
    });

    const resp = await response.json();
    if (response.ok) {
      fetchDictionary();
      toggleAlert(true, "Ordet ble sendt inn til ordboka!", "success");
      setWord("");
      setFrequency(5);
      setDescription("");
    } else {
      toggleAlert(true, "Noe gikk galt", "error");
    }
  }

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

  useEffect(() => {
    fetchDictionary();
  }, []);

  if (responseCode !== 200) {
    return <NoAccess responseCode={responseCode} responseText={responseText} />;
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
      <h1>Ordboka!</h1>
      <div style={{ justifyContent: "center", display: "flex" }}>
        <Card sx={{ width: 400 }}>
          <h3>Legg til nytt ord:</h3>
          <TextField
            label="Ord"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <br />
          <br />
          <Typography id="input-slider" gutterBottom>
            Hyppighet (1-10):
          </Typography>
          <Slider
            sx={{ width: 250 }}
            aria-label="Frequency"
            value={frequency}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            min={1}
            max={10}
          />
          <TextField
            label="Beskrivelse"
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <br />
          <br />
          <Button
            variant="contained"
            onClick={() => {
              submitWord();
            }}
          >
            Send inn ord
          </Button>
          <br />
          <br />
        </Card>
      </div>
      <br />
      <InputLabel id="demo-simple-select-label">Sorter etter</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        value={chosenFilter}
        onChange={(e) => {
          handleFilterChange(e.target.value);
        }}
      >
        {SORT_FILTERS.map((filter: string) => {
          return <MenuItem value={filter}>{filter}</MenuItem>;
        })}
      </Select>
      <Tabs
        sx={{
          boxShadow: "3px 3px 5px 2px rgba(0,0,0,.1)",
          backgroundColor: "white",
          margin: 2,
        }}
        value={chosenPerson}
        onChange={handlePersonChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {persons.map((person: string) => {
          return <Tab label={person} value={person} />;
        })}
      </Tabs>
      <div className="accums-flex-container">
        {dictionary.map((word: DictionaryT) => {
          if (
            chosenPerson == "Alle bidragsytere" ||
            chosenPerson == word.submitter.toLowerCase()
          ) {
            return (
              <>
                <div>
                  <Card
                    sx={{
                      backgroundColor: "white",
                      padding: 1,
                      width: 345,
                    }}
                  >
                    <h3>{word.word}</h3>
                    Hyppighet: {word.frequency} <br />
                    Innsendt av: {word.submitter} <br />
                    {word.description} <br />
                  </Card>
                </div>
              </>
            );
          }
        })}
      </div>
    </>
  );
}
