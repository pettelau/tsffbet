import React, { useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AlertColor,
  Button,
  Card,
  Typography,
} from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { selectAdmin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import NoAccess from "../NoAccess";
import { AdminUserDetails, AlertT } from "../../types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Switch from "@mui/material/Switch";
import AlertComp from "../Alert";

export default function AdminHome() {
  const url_path = useAppSelector(selectPath);

  const isAdmin = useAppSelector(selectAdmin);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();
  const [users, setUsers] = React.useState<AdminUserDetails[]>([]);

  const fetchUsers = async () => {
    const response = await fetch(`${url_path}api/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    console.log(response.status);
    setResponseCode(response.status);
    if (response.status == 200) {
      setUsers(resp);
    } else {
      console.log(resp.detail);
      setResponseText(resp.detail);
    }
  };

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

  async function setWhitelist(index: number) {
    let oldValue = [...users];

    console.log(oldValue[index].whitelist);
    console.log(!oldValue[index].whitelist);
    oldValue[index].whitelist = !oldValue[index].whitelist;
    setUsers(oldValue);

    let payload = {
      user_id: oldValue[index].user_id,
      whitelisted: oldValue[index].whitelist,
    };
    console.log(payload);

    const response = await fetch(`${url_path}api/admin/updatewl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(payload),
    });

    const resp = await response.json();
    if (response.ok) {
      toggleAlert(true, "Whitelist ble oppdatert!", "success");
      console.log(resp);
    } else {
      toggleAlert(true, "Noe gikk galt", "error");
    }
  }

  const MONTHS = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mai",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "des",
  ];

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
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
      <h2>Admin desktop</h2>
      {isAdmin ? (
        <>
          Admin!!
          <br />
          <Button
            onClick={() => {
              navigate("/admin/newbet");
            }}
          >
            Add nytt bet
          </Button>
          <br />
          <Button
            onClick={() => {
              navigate("/admin/editbet");
            }}
          >
            Endre bet
          </Button>
          <br />
          <h2>Brukere:</h2>
          {users.map((user: AdminUserDetails, index: number) => {
            return (
              <>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{user.username}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <>
                      Username: {user.username} <br />
                      User_id: {user.user_id} <br />
                      Balance: {user.balance} <br />
                      Created on:{" "}
                      {new Date(user.created_on).getDate() +
                        " " +
                        MONTHS[new Date(user.created_on).getMonth()] +
                        " " +
                        new Date(user.created_on).getFullYear() +
                        " " +
                        ("0" + new Date(user.created_on).getHours()).slice(-2) +
                        ":" +
                        ("0" + new Date(user.created_on).getMinutes()).slice(
                          -2
                        )}{" "}
                      <br />
                      Last login:{" "}
                      {new Date(
                        user.last_login ? user.last_login : ""
                      ).getDate() +
                        " " +
                        MONTHS[
                          new Date(
                            user.last_login ? user.last_login : ""
                          ).getMonth()
                        ] +
                        " " +
                        new Date(
                          user.last_login ? user.last_login : ""
                        ).getFullYear() +
                        " " +
                        (
                          "0" +
                          new Date(
                            user.last_login ? user.last_login : ""
                          ).getHours()
                        ).slice(-2) +
                        ":" +
                        (
                          "0" +
                          new Date(
                            user.last_login ? user.last_login : ""
                          ).getMinutes()
                        ).slice(-2)}
                      <br />
                      Number of Logins: {user.number_of_logins} <br />
                      Firstname: {user.firstname} <br />
                      Lastname: {user.lastname} <br />
                      Admin: {user.admin ? "Ja" : "Nei"} <br />
                      Whitelist:{" "}
                      <Switch
                        checked={user.whitelist}
                        onChange={() => {
                          setWhitelist(index);
                        }}
                      />
                      {user.whitelist ? "Ja" : "Nei"} <br />
                    </>
                  </AccordionDetails>
                </Accordion>

                <br />
              </>
            );
          })}
        </>
      ) : (
        <div>Du er dessverre ikke admin... Spør Lau om du kan bli?</div>
      )}
    </>
  );
}
