CREATE TABLE teams (
    team_id serial PRIMARY KEY,
    team_name character varying(250)
);

CREATE TABLE users (
    user_id serial PRIMARY KEY,
    username character varying(50) UNIQUE NOT NULL,
    password character varying(200) NOT NULL,
    balance numeric,
    created_on timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone,
    firstname character varying,
    lastname character varying,
    admin boolean DEFAULT false,
    whitelist boolean DEFAULT false,
    number_of_logins integer DEFAULT 0,
    team_id integer,
    CONSTRAINT fk_teams FOREIGN KEY (team_id) REFERENCES teams(team_id)
);



CREATE TABLE accums (
    accum_id serial PRIMARY KEY,
    stake numeric,
    total_odds numeric,
    paid_out boolean DEFAULT false,
    user_id integer,
    placed_timestamp timestamp without time zone DEFAULT now(),
    CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE bets (
    bet_id serial PRIMARY KEY,
    category character varying(50),
    title character varying(200) NOT NULL,
    bet_status integer DEFAULT 1,
    is_accepted boolean DEFAULT false,
    submitter character varying(200),
    added_timestamp timestamp with time zone DEFAULT now(),
    close_timestamp timestamp with time zone,
    closed_early timestamp with time zone,
    related_match integer,
    CONSTRAINT fk_related_match FOREIGN KEY (related_match) REFERENCES matches(match_id)
);

CREATE TABLE bet_options (
    option_id serial PRIMARY KEY,
    latest_odds numeric(10,3) NOT NULL,
    option_status integer DEFAULT 1 NOT NULL,
    option character varying(200) NOT NULL,
    bet integer,
    CONSTRAINT fk_bets FOREIGN KEY (bet) REFERENCES bets(bet_id)
);

CREATE TABLE accum_options (
    accum_option_id serial PRIMARY KEY,
    option_id integer,
    accum_id integer,
    user_odds numeric NOT NULL,
    CONSTRAINT fk_accums FOREIGN KEY (accum_id) REFERENCES accums(accum_id),
    CONSTRAINT fk_options FOREIGN KEY (option_id) REFERENCES bet_options(option_id)
);

CREATE TABLE matches (
    match_id serial PRIMARY KEY,
    ko_time timestamp with time zone,
    group_name character varying(200),
    home_team_id integer NOT NULL,
    away_team_id integer NOT NULL,
    home_goals integer,
    away_goals integer,
    CONSTRAINT fk_hteam FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_ateam FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
);

CREATE TABLE option_history (
    option_history_id serial PRIMARY KEY,
    update_timestamp timestamp with time zone DEFAULT NOW() NOT NULL,
    new_odds numeric(10,3) NOT NULL,
    option_id integer,
    CONSTRAINT fk_bet_options FOREIGN KEY (option_id) REFERENCES bet_options(option_id)
);


