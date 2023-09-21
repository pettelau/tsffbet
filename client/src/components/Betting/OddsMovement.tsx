import { Box, Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectPath } from "../../redux/envSlice";
import { HistoricOdds } from "../../types";
import OddsMovementChart from "./OddsMovementChart";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "97%",
  maxWidth: 800,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

interface ModalProps {
  betId: number;
  open: boolean;
  onClose: () => void;
}

export default function OddsMovementModal({
  betId,
  open,
  onClose,
}: ModalProps) {
  const url_path = useAppSelector(selectPath);

  const [oddsMovements, setOddsMovements] = useState<HistoricOdds[]>([]);

  const [responseCode, setResponseCode] = React.useState<number>();
  const [responseText, setResponseText] = React.useState<number>();

  const fetchOddsMovements = async () => {
    const response = await fetch(
      `${url_path}api/historicodds?bet_id=${betId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      }
    );
    const resp = await response.json();
    setResponseCode(response.status);
    if (response.status == 200) {
      setOddsMovements(resp);
    } else {
      setResponseText(resp.detail);
    }
  };

  useEffect(() => {
    fetchOddsMovements();
  }, []);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <>
          <Box sx={style}>
            <div style={{ textAlign: "center" }}>
              <OddsMovementChart oddsMovements={oddsMovements} />
              <br />
              <Button variant="contained" onClick={onClose}>
                Lukk
              </Button>
            </div>
          </Box>
        </>
      </Modal>
    </>
  );
}
