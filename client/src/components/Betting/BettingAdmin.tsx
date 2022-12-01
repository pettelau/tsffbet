import React from "react";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { queryAllByAltText } from "@testing-library/react";
import { Button } from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { selectAdmin } from "../../redux/userSlice";

export default function BettingAdmin() {
  const url_path = useAppSelector(selectPath);

  const isAdmin = useAppSelector(selectAdmin);

  return (
    <>
      <h2>Betting admin page</h2>
      {isAdmin ? (
        <>Admin!!</>
      ) : (
        <div>Du er dessverre ikke admin... Spør Lau om du kan bli?</div>
      )}
    </>
  );
}
