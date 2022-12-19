import {
  AlertColor,
  Button,
  Card,
  Chip,
  Divider,
  Paper,
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

export default function Dictionary() {
  const url_path = useAppSelector(selectPath);

  const [dictionary, setDictinary] = React.useState<DictionaryT[]>([]);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

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
    } else {
      setResponseText(resp.detail);
    }
  }

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

      <div className="accums-flex-container">
        {dictionary.map((word: DictionaryT) => {
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
        })}
      </div>
    </>
  );
}
