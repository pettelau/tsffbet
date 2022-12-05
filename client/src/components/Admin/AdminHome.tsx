import React, { useEffect } from "react";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { queryAllByAltText } from "@testing-library/react";
import { Button } from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { selectAdmin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import NoAccess from "../NoAccess";

export default function AdminHome() {
  const url_path = useAppSelector(selectPath);

  const isAdmin = useAppSelector(selectAdmin);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const fetchUsers = async () => {
    const response = await fetch(`${url_path}api/admin/getusers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    });
    const resp = await response.json();
    console.log(response.status);
    setResponseCode(response.status);
    if (response.status == 200) {
      console.log(resp);
    } else {
      console.log(resp.detail);
      setResponseText(resp.detail);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  if (responseCode !== 200) {
    return <NoAccess responseCode={responseCode} responseText={responseText} />;
  }
  return (
    <>
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
        </>
      ) : (
        <div>Du er dessverre ikke admin... Spør Lau om du kan bli?</div>
      )}
    </>
  );
}
