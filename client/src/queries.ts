import { gql } from "@apollo/client";

// Query for fetching all countries matching current search filters
export const GET_BETS = gql`
query Bets {
    bets {
      bet_id
      bet_status
      category
      title
      bet_options {
        option
        option_id
        latest_odds
      }
    }
  }
`;

export const GET_ACCUMS = gql`
query Query($where: AccumWhere) {
    accums(where: $where) {
      accum_id
      stake
      total_odds
      bet_optionsConnection {
        
        edges {
          user_odds
          node {
            option
            bet {
              title
              category
              bet_status
            }
          }
        }
      }
    }
}
`

export const CREATE_ACCUM = gql`
mutation CreateAccums($input: [AccumCreateInput!]!) {
    createAccums(input: $input) {
      accums {
        stake
        total_odds
        user {
          user_id
        }
        bet_options {
          option_id
        }
        }
    }
}`

// Query for fetching one username
export const GET_USER = gql`
  query User($where: UserWhere) {
    users(where: $where) {
      username
      firstname
      lastname
      balance
    }
  }
`;

// Query for fetching the hased password for a specific user
export const GET_HASH = gql`
  query UserPass($where: UserWhere) {
    users(where: $where) {
      password
    }
  }
`;

// Query for adding a new user
export const ADD_USER = gql`
  mutation CreateUsers($input: [UserCreateInput!]!) {
    createUsers(input: $input) {
      users {
        firstname
        lastname
        username
        password
      }
    }
  }
`;



