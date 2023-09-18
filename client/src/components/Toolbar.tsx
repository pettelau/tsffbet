import { styled } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  height: 40,
  [theme.breakpoints.up("sm")]: {
    height: 40,
  },
}));

export default Toolbar;
