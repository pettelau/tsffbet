import { useEffect, useState } from "react";
import MatchAccordion from "./MatchComp";
import { Match } from "../../types";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { CircularProgress } from "@mui/material";
import NoAccess from "../NoAccess";

import { useParams } from "react-router-dom";

export default function TeamMatches() {
  const params = useParams();
  const team = params.team;

  const url_path = useAppSelector(selectPath);

  const [matches, setMatches] = useState<Match[]>([]);

  const [responseCode, setResponseCode] = useState<number>();
  const [responseText, setResponseText] = useState<number>();

  // To separate finished and upcoming games
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const fetchMatches = async () => {
    if (team) {
      const encodedTeamName = encodeURIComponent(team);

      const response = await fetch(
        `${url_path}api/matcheswithodds?team=${encodedTeamName}&weather=True`
      );
      const resp = await response.json();
      setResponseCode(response.status);
      if (response.status == 200) {
        setMatches(resp);
        // let groups: string[] = ["Begge avdelinger"];
        // resp.forEach((match: Match) => {
        //   if (groups.indexOf(match.group_name.toLowerCase()) === -1) {
        //     groups.push(match.group_name.toLowerCase());
        //   }
        // });

        // setGroups(groups);
      } else {
        setResponseText(resp.detail);
      }
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

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
      <h2>Kommende kamper</h2>
      <div style={{ margin: "0 auto", maxWidth: 700, width: "96%" }}>
        {matches
          .filter(
            (match) => !match.ko_time || new Date(match.ko_time) >= twoHoursAgo
          )
          .sort((a, b) => {
            if (a.ko_time && b.ko_time) {
              return (
                new Date(a.ko_time).getTime() - new Date(b.ko_time).getTime()
              );
            }
            return 0;
          })
          .map((match: Match) => {
            return (
              <>
                <MatchAccordion match={match} />
              </>
            );
          })}
      </div>
      <h2>Spilte kamper</h2>
      <div style={{ margin: "0 auto", maxWidth: 700, width: "96%" }}>
        {matches
          .filter(
            (match) => match.ko_time && new Date(match.ko_time) < twoHoursAgo
          )
          .sort((a, b) => {
            if (a.ko_time && b.ko_time) {
              return (
                new Date(b.ko_time).getTime() - new Date(a.ko_time).getTime()
              );
            }
            return 0;
          })
          .map((match: Match) => {
            return (
              <>
                <MatchAccordion match={match} />
              </>
            );
          })}
      </div>
    </>
  );
}
