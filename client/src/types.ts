export type Bet = {
    title: string;
    bet_status: 1 | 2 | 3 | 4;
    bet_id: number;
    category: string;
    bet_options: BetOption[];
}

export type BetOption = {
    latest_odds: number;
    option: string;
    option_id: number;
}

export type AccumBetOption = {
    bet: string;
    option: BetOption;
}

export type Accums = {
    accum_id: number;
    stake: number;
    total_odds: number;
    bet_optionsConnection: Edges;
}

type Edges = {
    edges: AccumBet[]
}

type AccumBet = {
    user_odds: number;
    node: BetNode;
}

type BetNode = {
    option: string;
    bet: AccumBetDetails
}

type AccumBetDetails = {
    bet_status: 1 | 2 | 3 | 4;
    category: string;
    title: string;
}

import { AlertColor } from "@mui/material/Alert";

// Alert type
export type AlertT = {
  type: AlertColor;
  msg: string;
};

// Alert properties
export interface AlertProps {
  setAlert: (alert: boolean) => void;
  _alert: boolean;
  _alertType: AlertT;
  toggleAlert: (prop: boolean) => void;
}

export type UserDetails = {
    username: string,
    balance: number,
    firstname: string,
    lastname: string,
}

