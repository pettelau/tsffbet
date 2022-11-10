import Alert, { AlertColor } from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import { AlertProps } from "../types";

function AlertComp(props: AlertProps) {
  return (
    <>
      {props._alert ? (
        <>
          <Alert
            action={
              <Button
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  props.toggleAlert(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </Button>
            }
            sx={{ mb: 2 }}
            severity={props._alertType?.type}
          >
            {props._alertType?.msg.toString()}
          </Alert>
        </>
      ) : (
        ""
      )}
    </>
  );
}

export default AlertComp;
