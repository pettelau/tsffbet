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

export type UserAvailability = {
    checkedDB: boolean;
    userTaken: boolean;
}


export type AccumBets = {
    bet: string;
    user_odds: number,
    chosen_option: string;
    option_status: 1 | 2 | 3 | 4
}

export type Accums = {
    accum_id: number;
    stake: number;
    total_odds: number;
    accumBets: AccumBets[];
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
    admin: boolean,
}


  // {category: "string", title: "string", options: [{latest_odds: number, option: "string"}]}

  export type NewBetType = {
    title: string,
    category: string,
    options: NewOptionType[]
  }

export type NewOptionType = {
    latest_odds: number | null,
    option: string
}