import React from "react";
import { SortedTeamData } from "../types";
import { Tooltip } from "@mui/material";

import { useNavigate } from "react-router-dom";

type TableProps = {
  groupName: string;
  tableData: SortedTeamData[];
};

type AsItStandsProps = {
  tableData: SortedTeamData[];
};

function getRowColor(index: number) {
  if (index < 3) {
    return "#38c827";
  } else if (index > 2 && index < 6) {
    return "#a7eb9f";
  } else if (index > 5 && index < 9) {
    return "#f2d8ab";
  } else if (index > 8 && index < 12) {
    return "#ffb478";
  } else {
    return "#fa6a6a";
  }
}

function getRowColorAsItStands(index: number) {
  if (index < 6) {
    return "#38c827";
  } else if (index > 5 && index < 12) {
    return "#a7eb9f";
  } else if (index > 11 && index < 18) {
    return "#f2d8ab";
  } else if (index > 17 && index < 24) {
    return "#ffb478";
  } else {
    return "#fa6a6a";
  }
}

function getRowEndGame(index: number) {
  if (index < 6) {
    return "A";
  } else if (index > 5 && index < 12) {
    return "B";
  } else if (index > 11 && index < 18) {
    return "C";
  } else if (index > 17 && index < 24) {
    return "D";
  } else {
    return "E";
  }
}

function getFormButtons(form: string) {
  if (form.length > 3) {
    form = form.slice(0, 3);
  }
  let formDivs = [];
  for (const res of form) {
    if (res === "W") {
      formDivs.push(<div className="winForm">W</div>);
    } else if (res === "D") {
      formDivs.push(<div className="drawForm">D</div>);
    } else {
      formDivs.push(<div className="loseForm">L</div>);
    }
  }
  return formDivs;
}

export const LeagueTable: React.FC<TableProps> = ({ groupName, tableData }) => {
  const navigate = useNavigate();

  return (
    <>
      <h2>{groupName}</h2>
      <div className="table-div-league">
        <table className="table-league">
          <thead>
            <tr style={{ backgroundColor: "white" }}>
              <th>#</th>
              <th className="table-teams">LAG</th>
              <th>K</th>
              <th className="table-mf">G:A</th>

              <th>MF</th>
              <th>PNG</th>
              <Tooltip
                PopperProps={{
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10], // [x, y]. Adjust the y value as needed.
                      },
                    },
                  ],
                }}
                title="Nyest til venstre"
              >
                <th>Form</th>
              </Tooltip>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>
                  <div
                    style={{
                      backgroundColor: getRowColor(index),
                      borderRadius: 7,
                    }}
                  >
                    {" "}
                    {index + 1}.
                  </div>
                </td>
                <td
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate(`/resultater/${row.team}`);
                  }}
                  className="table-teams"
                >
                  {row.team}
                </td>
                <td>{row.games_played}</td>
                <td>
                  {row.goalsScored}:{row.goalsConceded}
                </td>
                <td className="table-mf">
                  {row.goalsScored - row.goalsConceded}
                </td>
                <td>
                  <b>{row.points}</b>
                </td>
                <td>
                  <div className="forms">{getFormButtons(row.form)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const AsItStands: React.FC<AsItStandsProps> = ({ tableData }) => {
  return (
    <>
      <h2>👀 Sluttspill våren 2024 👀</h2>
      <div className="table-div-league">
        <table className="table-asitstands">
          <thead>
            <tr style={{ backgroundColor: "white" }}>
              <th>🏆</th>
              <th className="table-teams">LAG</th>
              <th>
                <div style={{ marginRight: 10 }}>K</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                style={{
                  borderTop: index % 6 === 0 ? "3px solid black" : "",
                }}
              >
                <td>
                  <div
                    style={{
                      backgroundColor: getRowColorAsItStands(index),
                      borderRadius: 7,
                    }}
                  >
                    {getRowEndGame(index)}.
                  </div>
                </td>
                <td className="table-teams-asitstands">
                  <div
                    style={{
                      marginRight: 15,
                      backgroundColor:
                        row.group_name[row.group_name.length - 1] === "A"
                          ? "#b8b1f7"
                          : "#fcce7e",
                    }}
                    className="team-group"
                  >
                    Avd. {row.group_name[row.group_name.length - 1]}
                  </div>
                  <div>{row.team}</div>
                </td>
                <td>
                  <div style={{ marginRight: 10 }}>{row.games_played}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
