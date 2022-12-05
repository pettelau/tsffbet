import React from "react";

export default function NoAccess(props: any) {
  return (
    <>
      <h2>Du har ikke tilgang til denne siden</h2>
      <h4>Årsak:</h4>
      {props.responseCode}: {props.responseCode == 401 ? "Unauthorized - " : ""}
      {props.responseCode == 403 ? "Forbidden - " : ""}
      {props.responseText}
    </>
  );
}
