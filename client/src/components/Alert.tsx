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
                sx={{ ml: 0 }}
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  props.toggleAlert(false);
                }}
              >
                <CloseIcon sx={{padding: 0}} fontSize="small" />
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
