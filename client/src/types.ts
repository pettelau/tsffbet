/* eslint-disable import/first */
// eslint-disable-next-line
import { AlertColor } from "@mui/material/Alert";

export type Bet = {
  title: string;
  bet_status: 1 | 2 | 3 | 4;
  bet_id: number;
  submitter: string;
  category: string;
  close_timestamp: Date;
  bet_options: BetOption[];
  is_accepted: undefined | Boolean;
};
export type BetAdmin = {
  title: string;
  bet_status: 1 | 2 | 3 | 4;
  bet_id: number;
  submitter: string;
  category: string;
  added_timestamp: Date;
  close_timestamp: Date;
  closed_early: Date | undefined;
  bet_options: BetOptionAdmin[];
  is_accepted: undefined | Boolean;
  related_match: number | undefined;
};

export type BetOption = {
  latest_odds: number;
  option: string;
  option_id: number;
  option_status: 1 | 2 | 3 | 4;
};
export type BetOptionAdmin = {
  latest_odds: number | null;
  option: string;
  option_id: number;
  option_status: 1 | 2 | 3 | 4;
};

// export type AdminBet = {
//     title: string;
//     bet_status: 1 | 2 | 3 | 4;
//     bet_id: number;
//     category: string;
//     bet_options: AdminBetOption[];
// }

// export type AdminBetOption = {
//     latest_odds: number;
//     option: string;
//     option_id: number;
//     option_status: 1 | 2 | 3 | 4
// }

export type AccumBetOption = {
  bet: string;
  option: BetOption;
};

export type UserAvailability = {
  checkedDB: boolean;
  userTaken: boolean;
};

export type Team = {
  team_id: number;
  team_name: string;
};

export type Match = {
  match_id: number;
  ko_time: Date | undefined;
  group_name: string;
  home_team: string;
  away_team: string;
  home_goals: number | undefined;
  away_goals: number | undefined;
  match_bets: Bet[];
};

export type MatchSimple = {
  match_id: number;
  ko_time: Date | undefined;
  home_team: string;
  away_team: string;
};

export type NewMatchSimple = {
  ko_time: Date;
  home_team_id: number;
  away_team_id: number;
  group: string;
};

export type AccumBets = {
  title: string;
  user_odds: number;
  option: string;
  option_status: 1 | 2 | 3 | 4;
};

export type Accums = {
  accum_id: number;
  stake: number;
  username: undefined | string;
  total_odds: number;
  placed_timestamp: Date;
  accumBets: AccumBets[];
};

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
  username: string;
  balance: number;
  firstname: string;
  lastname: string;
  associated_team: string | null;
  admin: boolean;
  created_on: Date;
};

// {category: "string", title: "string", options: [{latest_odds: number, option: "string"}]}

export type NewBetType = {
  title: string;
  category: string;
  close_date: Date;
  related_match: number | undefined;
  options: NewOptionType[];
};

export type NewOptionType = {
  latest_odds: number | null;
  option: string;
};

export type DictionaryT = {
  word_id: number;
  frequency: number;
  word: string;
  description: string;
  submitter: string;
};

export type CompetitionT = {
  username: string;
  registered: number;
};

export type AdminUserDetails = {
  user_id: number;
  username: string;
  admin: boolean;
  whitelist: boolean;
  balance: number;
  created_on: Date;
  last_login: undefined | Date;
  firstname: undefined | string;
  lastname: undefined | string;
  number_of_logins: number;
};

export type LeaderboardData = {
  username: string;
  associated_team: string | null;
  associated_team_id: number | null;
  balance: number;
  won_accums: number;
  total_accums: number;
};

export type PublicUserData = {
  balance: number;
  firstname: string;
  lastname: string;
  last_login: undefined | Date;
  associated_team: string | null;
};

export type Stats = {
  num_users: number;
  num_accums: number;
  avg_stake: number;
  avg_user_balance: number;
  total_stakes: OptionStake[];
};

export type OptionStake = {
  option_id: number;
  total_stake: number;
  option: string;
  title: string;
  number_accums: number;
};
