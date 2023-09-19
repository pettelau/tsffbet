from typing import List, Optional
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from .auth_utils import authUtils
from dateutil import parser

from .db_instance import database

app = FastAPI()


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/openbets")
async def get_open_bets(token: str = Depends(authUtils.validate_access_token)):
    bets = await database.fetch_all(
        "select * from bets where bet_status = 1 and is_accepted = true and close_timestamp > NOW() and closed_early IS NULL ORDER BY close_timestamp ASC"
    )
    bets_with_options = []
    for bet in bets:
        options_query = "select option_id, latest_odds, option_status, option from bet_options where bet = :bet"
        options = await database.fetch_all(options_query, {"bet": bet["bet_id"]})
        bet_with_option = dict(bet)
        bet_with_option["bet_options"] = options
        bets_with_options.append(bet_with_option)
    return bets_with_options


@app.get("/api/standalonebets")
async def get_standalone_bets(token: str = Depends(authUtils.validate_access_token)):
    bets = await database.fetch_all(
        "select * from bets where bet_status = 1 and is_accepted = true and close_timestamp > NOW() and closed_early IS NULL and related_match IS NULL ORDER BY close_timestamp ASC"
    )
    bets_with_options = []
    for bet in bets:
        options_query = "select option_id, latest_odds, option_status, option from bet_options where bet = :bet"
        options = await database.fetch_all(options_query, {"bet": bet["bet_id"]})
        bet_with_option = dict(bet)
        bet_with_option["bet_options"] = options
        bets_with_options.append(bet_with_option)
    return bets_with_options


@app.get("/api/matchbets")
async def get_open_bets(
    match_id: int, token: str = Depends(authUtils.validate_access_token)
):
    bets = await database.fetch_all(
        "select * from bets where bet_status = 1 and is_accepted = true and close_timestamp > NOW() and closed_early IS NULL and related_match = :match_id ORDER BY close_timestamp ASC",
        {"match_id": match_id},
    )
    bets_with_options = []
    for bet in bets:
        options_query = "select option_id, latest_odds, option_status, option from bet_options where bet = :bet"
        options = await database.fetch_all(options_query, {"bet": bet["bet_id"]})
        bet_with_option = dict(bet)
        bet_with_option["bet_options"] = options
        bets_with_options.append(bet_with_option)
    return bets_with_options


@app.get("/api/requestedbets")
async def get_requested_bets():
    try:
        bets = await database.fetch_all("select * from bets where is_accepted = false")
        bets_with_options = []
        for bet in bets:
            options_query = "select option_id, latest_odds, option_status, option from bet_options where bet = :bet"
            options = await database.fetch_all(options_query, {"bet": bet["bet_id"]})
            bet_with_option = dict(bet)
            bet_with_option["bet_options"] = options
            bets_with_options.append(bet_with_option)
        return bets_with_options
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/stats")
async def get_stats(
    offset: int = 0,
    limit: int = 20,
    token: str = Depends(authUtils.validate_access_token),
):
    try:
        num_users = await database.fetch_one("SELECT COUNT(*) FROM users")
        num_accums = await database.fetch_one("SELECT COUNT(*) FROM accums")
        balance_sum_total = await database.fetch_one("SELECT SUM(balance) FROM users")
        accum_sum_total = await database.fetch_one("SELECT SUM(stake) FROM accums")
        total_stakes = await database.fetch_all(
            """SELECT 
                accum_options.option_id, 
                SUM(stake) AS total_stake, 
                option, 
                title,
                COUNT(DISTINCT(accums.accum_id)) as number_accums
            FROM 
                accum_options 
            LEFT JOIN 
                bet_options ON accum_options.option_id = bet_options.option_id 
            LEFT JOIN 
                accums ON accum_options.accum_id = accums.accum_id 
            LEFT JOIN 
                bets ON bet_options.bet = bets.bet_id
            GROUP BY 
                accum_options.option_id, 
                option, 
                title
            ORDER BY total_stake DESC
            LIMIT :limit OFFSET :offset
            """,
            {"limit": limit, "offset": offset},
        )
        print(dict(num_users))
        stats = {
            "num_users": num_users["count"],
            "num_accums": num_accums["count"],
            "avg_stake": round((accum_sum_total["sum"] / num_accums["count"]), 1),
            "avg_user_balance": round(
                (balance_sum_total["sum"] / num_users["count"]), 1
            ),
            "total_stakes": total_stakes,
        }
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/leaderboard")
async def get_leaderboard(
    token: str = Depends(authUtils.validate_access_token),
):
    try:
        leaderboard_data = []
        users_query = "select username, user_id, balance, teams.team_name as associated_team, teams.team_id as associated_team_id from users left join teams on users.team_id = teams.team_id"
        users = await database.fetch_all(users_query)

        for user in users:
            user_data = {
                "username": user["username"],
                "associated_team": user["associated_team"],
                "associated_team_id": user["associated_team_id"],
                "balance": user["balance"],
            }
            won_accums_query = (
                "select count(*) from accums where user_id = :user_id and paid_out=true"
            )
            won_accums = await database.fetch_one(
                won_accums_query, {"user_id": user["user_id"]}
            )
            total_accums_query = "select count(*) from accums where user_id = :user_id"
            total_accums = await database.fetch_one(
                total_accums_query, {"user_id": user["user_id"]}
            )
            user_data["won_accums"] = won_accums["count"]
            user_data["total_accums"] = total_accums["count"]

            leaderboard_data.append(user_data)
        return leaderboard_data

    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


async def is_admin(username):
    res = await database.fetch_one(
        "select admin from users where username = :username", {"username": username}
    )
    if res["admin"]:
        return True
    else:
        return False


@app.get("/api/admin/allbets")
async def get_all_admin_bets(
    skip: int = 0,
    limit: int = 15,
    token: str = Depends(authUtils.validate_access_token),
):
    try:
        if await is_admin(token["user"]):
            bets = await database.fetch_all(
                f"SELECT * FROM bets ORDER BY bet_id DESC LIMIT {limit} OFFSET {skip}"
            )
            bets_with_options = []

            for bet in bets:
                query = "SELECT option_id, latest_odds, option_status, option FROM bet_options WHERE bet = :bet"

                options = await database.fetch_all(query, {"bet": bet["bet_id"]})

                bet_with_option = dict(bet)  # Convert record to dictionary
                bet_with_option["bet_options"] = options
                bets_with_options.append(bet_with_option)

            return bets_with_options
        else:
            raise HTTPException(status_code=403, detail="You are not admin")
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong.")


@app.get("/api/useraccums")
async def get_accums(user, token: str = Depends(authUtils.validate_access_token)):
    try:
        accum_query = "SELECT accum_id, stake, total_odds, username, placed_timestamp FROM accums LEFT JOIN users ON accums.user_id = users.user_id WHERE users.username = :username ORDER BY placed_timestamp DESC"
        accums = await database.fetch_all(accum_query, {"username": user})
        accums_with_options = []
        for accum in accums:
            accum_options_query = "SELECT bets.title, accum_options.user_odds, bet_options.option, bet_options.option_status FROM bet_options NATURAL JOIN accum_options LEFT JOIN bets ON bet_options.bet = bets.bet_id INNER JOIN accums ON accum_options.accum_id = accums.accum_id WHERE accums.accum_id = :accum_id"

            accum_options = await database.fetch_all(
                accum_options_query, {"accum_id": accum["accum_id"]}
            )
            accum = dict(accum)
            accum["accumBets"] = accum_options
            accums_with_options.append(accum)
        return accums_with_options
    except Exception as e:
        print(e)
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/publicuserdata")
async def user_data_public(user, token: str = Depends(authUtils.validate_access_token)):
    try:
        query = "select balance, firstname, lastname, last_login, teams.team_name as associated_team from users left join teams on users.team_id = teams.team_id where username = :username"
        res = await database.fetch_one(query, {"username": user})
        return res
    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/allaccums")
async def get_accums(
    skip: int = 0,
    limit: int = 15,
    token: str = Depends(authUtils.validate_access_token),
):
    try:
        accums_query = """
            SELECT accum_id, stake, total_odds, username, placed_timestamp 
            FROM accums 
            LEFT JOIN users ON accums.user_id = users.user_id 
            ORDER BY placed_timestamp DESC 
            LIMIT :limit OFFSET :skip
        """
        accums = await database.fetch_all(accums_query, {"limit": limit, "skip": skip})

        accums_with_options = []
        for accum in accums:
            options_query = """
                SELECT bets.title, accum_options.user_odds, bet_options.option, bet_options.option_status 
                FROM bet_options 
                NATURAL JOIN accum_options 
                LEFT JOIN bets ON bet_options.bet = bets.bet_id 
                INNER JOIN accums ON accum_options.accum_id = accums.accum_id 
                WHERE accums.accum_id = :accum_id
            """
            accum_options = await database.fetch_all(
                options_query, {"accum_id": accum["accum_id"]}
            )

            accum_dict = dict(accum)  # Convert record to dictionary
            accum_dict["accumBets"] = accum_options
            accums_with_options.append(accum_dict)

        return accums_with_options
    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/userAvailability/{user}")
async def user_availability(user: str):
    try:
        print("her")
        res = await database.fetch_one(
            "select exists(select 1 from users where username = :username)",
            {"username": user},
        )
        if res["exists"]:
            return {"userTaken": True}
        else:
            return {"userTaken": False}

    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/teams")
async def all_teams():
    try:
        res = await database.fetch_all("SELECT * FROM teams")

        return {"teams": res}
    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/matches")
async def all_matches(in_future: bool = True):
    try:
        matches_query = """
        SELECT 
            m.match_id, 
            m.ko_time, 
            m.group_name, 
            m.home_goals, 
            m.away_goals,
            home_team.team_name AS home_team,
            away_team.team_name AS away_team
        FROM 
            matches m
        JOIN 
            teams home_team ON m.home_team_id = home_team.team_id
        JOIN 
            teams away_team ON m.away_team_id = away_team.team_id
        """
        if in_future:
            matches_query += " WHERE m.ko_time > NOW()"
        matches = await database.fetch_all(matches_query)

        return matches
    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/matchessimple")
async def all_matches_simple(in_future: bool = None):
    try:
        matches_query = """
        SELECT 
            m.match_id, 
            m.ko_time, 
            home_team.team_name AS home_team,
            away_team.team_name AS away_team
        FROM 
            matches m
        JOIN 
            teams home_team ON m.home_team_id = home_team.team_id
        JOIN 
            teams away_team ON m.away_team_id = away_team.team_id
        """
        if in_future is not None:
            if in_future:
                matches_query += " WHERE m.ko_time > NOW() ORDER BY ko_time ASC"
            else:
                matches_query += " WHERE m.ko_time < NOW() ORDER BY m.ko_time DESC"
        else:
            matches_query += " ORDER BY ko_time DESC"
        matches = await database.fetch_all(matches_query)

        return matches
    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/matcheswithodds")
async def all_matches_odds(in_future: bool = None):
    try:
        matches_query = """
        SELECT 
            m.match_id, 
            m.ko_time, 
            m.group_name, 
            m.home_goals, 
            m.away_goals,
            home_team.team_name AS home_team,
            away_team.team_name AS away_team
        FROM 
            matches m
        JOIN 
            teams home_team ON m.home_team_id = home_team.team_id
        JOIN 
            teams away_team ON m.away_team_id = away_team.team_id
        """
        if in_future is not None:
            if in_future:
                matches_query += " WHERE m.ko_time > NOW() ORDER BY ko_time ASC"
            else:
                matches_query += " WHERE m.ko_time < NOW() ORDER BY m.ko_time DESC"
        else:
            matches_query += " ORDER BY ko_time ASC"
        matches = await database.fetch_all(matches_query)

        matches_with_odds = []
        for match in matches:
            print(match["match_id"])
            if in_future:
                bets_query = "select * from bets where bet_status = 1 and is_accepted = true and close_timestamp > NOW() and closed_early IS NULL and related_match = :match_id ORDER BY close_timestamp ASC"
            else:
                bets_query = "select * from bets where is_accepted = true and close_timestamp < NOW() and related_match = :match_id ORDER BY close_timestamp ASC"

            bets = await database.fetch_all(
                bets_query,
                {"match_id": match["match_id"]},
            )
            print(bets)
            bets_with_options = []
            for bet in bets:
                options_query = "select option_id, latest_odds, option_status, option from bet_options where bet = :bet"
                options = await database.fetch_all(
                    options_query, {"bet": bet["bet_id"]}
                )
                bet_with_option = dict(bet)
                bet_with_option["bet_options"] = options
                bets_with_options.append(bet_with_option)
            match = dict(match)
            match["match_bets"] = bets_with_options
            matches_with_odds.append(match)
        return matches_with_odds
    except Exception:
        return HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/login/")
async def login(user, password):
    try:
        # Fetch user details
        query = "SELECT user_id, password FROM users WHERE username = :username"
        user_data = await database.fetch_one(query, {"username": user})

        if not user_data:
            return {"loggedIn": False}

        user_id = user_data["user_id"]
        stored_password = user_data["password"]

        # Check password
        if bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
            jwt = await authUtils.create_access_token(user, user_id)

            # Update last login
            update_last_login = (
                "UPDATE users SET last_login = NOW() WHERE user_id = :user_id"
            )
            await database.execute(update_last_login, {"user_id": user_id})

            return {"loggedIn": True, "jwt": jwt}
        else:
            return {"loggedIn": False}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/login/details")
async def login_details(
    token: str = Depends(authUtils.validate_access_token_nowhitelist),
):
    try:
        # Fetch user details
        query = """
        SELECT username, balance, firstname, lastname, teams.team_name as associated_team, admin, created_on
        FROM users
        LEFT JOIN teams ON users.team_id = teams.team_id
        WHERE username = :username
        """
        res = await database.fetch_one(query, {"username": token["user"]})
        # Update last login
        query2 = "UPDATE users SET last_login = NOW() WHERE user_id = :user_id"
        await database.execute(query2, {"user_id": token["user_id"]})

        # Increment number of logins
        inc_numb_logins = "UPDATE users SET number_of_logins = number_of_logins + 1 WHERE user_id = :user_id"
        await database.execute(inc_numb_logins, {"user_id": token["user_id"]})

        return res
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.get("/api/admin/users")
async def get_users(token: str = Depends(authUtils.validate_access_token)):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        res = await database.fetch_all(
            "SELECT user_id, username, balance, created_on, last_login, firstname, lastname, admin, whitelist, number_of_logins FROM users"
        )
        return res
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/createbet")
async def create_bet(bet: dict, token: str = Depends(authUtils.validate_access_token)):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        close_date = parser.parse(bet["close_date"])
        bet_id = await database.execute(
            "INSERT INTO bets(category, title, is_accepted, submitter, close_timestamp, related_match) VALUES (:category, :title, true, :submitter, :close_date, :related_match) RETURNING bet_id",
            {
                "category": bet["category"],
                "title": bet["title"],
                "submitter": token["user"],
                "close_date": close_date,
                "related_match": bet.get("related_match", None),
            },
        )

        for option in bet["options"]:
            await database.execute(
                "INSERT INTO bet_options(latest_odds, option, bet) VALUES (:latest_odds, :option, :bet)",
                {
                    "latest_odds": float(option["latest_odds"]),
                    "option": option["option"],
                    "bet": bet_id,
                },
            )

        return {"settleBet": True}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/creatematch")
async def create_match(
    match: dict, token: str = Depends(authUtils.validate_access_token)
):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        ko_time = parser.parse(match["ko_time"])

        new_match_query = "insert into matches (ko_time, group_name, home_team_id, away_team_id) values (:ko_time, :group_name, :home_team_id, :away_team_id)"
        params = {
            "ko_time": ko_time,
            "group_name": match["group"],
            "home_team_id": match["home_team_id"],
            "away_team_id": match["away_team_id"],
        }
        await database.execute(new_match_query, params)
        return {"createMatch": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/updatematchscore")
async def update_match_score(
    match_score: dict, token: str = Depends(authUtils.validate_access_token)
):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        update_match_query = "update matches set home_goals = :home_goals, away_goals = :away_goals where match_id = :match_id"
        params = {
            "home_goals": match_score["home_goals"],
            "away_goals": match_score["away_goals"],
            "match_id": match_score["match_id"],
        }
        await database.execute(update_match_query, params)
        return {"updateMatch": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/updatematchtime")
async def update_match_time(
    match_time: dict, token: str = Depends(authUtils.validate_access_token)
):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        ko_time = parser.parse(match_time["ko_time"])
        update_match_query = (
            "update matches set ko_time = :ko_time where match_id = :match_id"
        )
        params = {
            "ko_time": ko_time,
            "match_id": match_time["match_id"],
        }
        await database.execute(update_match_query, params)
        return {"updateMatchTime": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/acceptbet")
async def accept_bet(bet: dict, token: str = Depends(authUtils.validate_access_token)):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        await database.execute(
            "UPDATE bets SET is_accepted = true WHERE bet_id = :bet_id",
            {"bet_id": bet["bet_id"]},
        )
        return {"closeBet": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/updateoption")
async def update_option(
    option: dict, token: str = Depends(authUtils.validate_access_token)
):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        await database.execute(
            "UPDATE bet_options SET option = :option, latest_odds = :latest_odds WHERE option_id = :option_id",
            {
                "option": option["option"],
                "latest_odds": option["latest_odds"],
                "option_id": option["option_id"],
            },
        )
        return {"updateOption": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/addoption")
async def add_option(
    option: dict, token: str = Depends(authUtils.validate_access_token)
):
    if not await is_admin(token["user"]):
        raise HTTPException(status_code=403, detail="You are not admin")

    try:
        await database.execute(
            "INSERT INTO bet_options(latest_odds, option, bet) VALUES (:latest_odds, :option, :bet)",
            {
                "latest_odds": option["latest_odds"],
                "option": option["option"],
                "bet": option["bet"],
            },
        )
        return {"addOption": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/updatewl")
async def update_wl(
    payload: dict, token: str = Depends(authUtils.validate_access_token)
):
    try:
        if await is_admin(token["user"]):
            await database.execute(
                "UPDATE users SET whitelist = :whitelisted WHERE user_id = :user_id",
                {"whitelisted": payload["whitelisted"], "user_id": payload["user_id"]},
            )
            return {"updateWhitelist": True}
        else:
            raise HTTPException(status_code=403, detail="You are not admin")
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/closebet")
async def close_bet(bet: dict, token: str = Depends(authUtils.validate_access_token)):
    try:
        if await is_admin(token["user"]):
            await database.execute(
                "UPDATE bets SET closed_early = NOW() WHERE bet_id = :bet_id",
                {"bet_id": bet["bet_id"]},
            )
            return {"acceptBet": True}
        else:
            raise HTTPException(status_code=403, detail="You are not admin")
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/updaterelatedmatch")
async def update_related_match_bet(
    bet: dict, token: str = Depends(authUtils.validate_access_token)
):
    try:
        if await is_admin(token["user"]):
            await database.execute(
                "UPDATE bets SET related_match = :match_id WHERE bet_id = :bet_id",
                {"match_id": bet["match_id"], "bet_id": bet["bet_id"]},
            )
            return {"updateRelatedMatch": True}
        else:
            raise HTTPException(status_code=403, detail="You are not admin")
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/resetPassword")
async def reset_password(
    payload: dict, token: str = Depends(authUtils.validate_access_token)
):
    try:
        if await is_admin(token["user"]):
            hashed = bcrypt.hashpw(
                bytes(payload["new_password"], encoding="utf-8"), bcrypt.gensalt()
            )

            await database.execute(
                "UPDATE users SET password = :password WHERE user_id = :user_id",
                {"password": hashed.decode("utf-8"), "user_id": payload["user_id"]},
            )

            return {"updatePassword": True}
        else:
            raise HTTPException(status_code=403, detail="You are not admin")
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/resetPassword")
async def reset_password(
    payload: dict, token: str = Depends(authUtils.validate_access_token_nowhitelist)
):
    try:
        hashed = bcrypt.hashpw(
            bytes(payload["new_password"], encoding="utf-8"), bcrypt.gensalt()
        )

        await database.execute(
            "UPDATE users SET password = :password WHERE user_id = :user_id",
            {"password": hashed.decode("utf-8"), "user_id": token["user_id"]},
        )

        return {"updatePassword": True}
    except Exception:
        raise HTTPException(
            status_code=400, detail="Something wrong. Could not reset password"
        )


@app.post("/api/requestbet")
async def request_bet(bet: dict, token: str = Depends(authUtils.validate_access_token)):
    try:
        close_date = parser.parse(bet["close_date"])

        bet_id = await database.execute(
            "INSERT INTO bets(category, title, submitter, close_timestamp) VALUES (:category, :title, :submitter, :close_date) RETURNING bet_id",
            {
                "category": bet["category"],
                "title": bet["title"],
                "submitter": token["user"],
                "close_date": close_date,
            },
        )

        for option in bet["options"]:
            await database.execute(
                "INSERT INTO bet_options(latest_odds, option, bet) VALUES (:latest_odds, :option, :bet)",
                {
                    "latest_odds": float(option["latest_odds"]),
                    "option": option["option"],
                    "bet": bet_id,
                },
            )

        return {"requestBet": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/admin/settlebet")
async def settle_bet(bet: dict, token: str = Depends(authUtils.validate_access_token)):
    try:
        if await is_admin(token["user"]):
            async with database.transaction():
                await database.execute(
                    "UPDATE bets SET bet_status = 2 WHERE bet_id = :bet_id",
                    {"bet_id": bet["bet_id"]},
                )

                for option in bet["bet_options"]:
                    await database.execute(
                        "UPDATE bet_options SET option_status = :option_status WHERE option_id = :option_id",
                        {
                            "option_status": option["option_status"],
                            "option_id": option["option_id"],
                        },
                    )

                accum_ids = await database.fetch_all(
                    "SELECT DISTINCT accum_id FROM accums NATURAL JOIN accum_options NATURAL JOIN bet_options WHERE bet = :bet_id AND paid_out = FALSE",
                    {"bet_id": bet["bet_id"]},
                )

                for accum in accum_ids:
                    accum_id = accum["accum_id"]
                    accum_options = await database.fetch_all(
                        "SELECT option_status, stake, total_odds, user_id FROM accum_options LEFT JOIN bet_options ON accum_options.option_id = bet_options.option_id LEFT JOIN accums ON accum_options.accum_id = accums.accum_id WHERE accums.accum_id = :accum_id",
                        {"accum_id": accum_id},
                    )

                    bet_went_in = all(
                        option["option_status"] == 2 for option in accum_options
                    )

                    if bet_went_in:
                        user_id = accum_options[0]["user_id"]
                        pay_out_sum = (
                            accum_options[0]["stake"] * accum_options[0]["total_odds"]
                        )
                        await database.execute(
                            "UPDATE users SET balance = balance + :pay_out_sum WHERE user_id = :user_id",
                            {"pay_out_sum": pay_out_sum, "user_id": user_id},
                        )
                        await database.execute(
                            "UPDATE accums SET paid_out = TRUE WHERE accum_id = :accum_id",
                            {"accum_id": accum_id},
                        )

            return {"settleBet": True}
        else:
            raise HTTPException(status_code=403, detail="You are not admin")
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


@app.post("/api/placebet")
async def place_bet(bet: dict, token: str = Depends(authUtils.validate_access_token)):
    try:
        res = await database.fetch_one(
            "SELECT balance FROM users WHERE username = :username",
            {"username": token["user"]},
        )

        # TODO add check if closetime is in future and closed_early is none

        if res["balance"] >= bet["totalodds"]:
            async with database.transaction():
                accum_id = await database.execute(
                    "INSERT INTO accums(stake, total_odds, user_id) VALUES (:stake, :total_odds, :user_id) RETURNING accum_id",
                    {
                        "stake": float(bet["stake"]),
                        "total_odds": float(bet["totalodds"]),
                        "user_id": int(token["user_id"]),
                    },
                )

                for option in bet["bets"]:
                    await database.execute(
                        "INSERT INTO accum_options(option_id, accum_id, user_odds) VALUES (:option_id, :accum_id, :user_odds)",
                        {
                            "option_id": option["option"]["option_id"],
                            "accum_id": accum_id,
                            "user_odds": option["option"]["latest_odds"],
                        },
                    )

                await database.execute(
                    "UPDATE users SET balance = balance - :stake WHERE user_id = :user_id",
                    {"stake": float(bet["stake"]), "user_id": int(token["user_id"])},
                )
        else:
            return {
                "placeBet": False,
                "errorMsg": "Ikke nok penger på konto.",
            }

        return {"placeBet": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Something went wrong")


class UserCreate(BaseModel):
    username: str
    password: str
    firstname: str
    lastname: str
    team_id: Optional[int] = None


@app.post("/api/createUser")
async def add_user(user: UserCreate):
    hashed = bcrypt.hashpw(bytes(user.password, encoding="utf-8"), bcrypt.gensalt())
    try:
        if user.team_id is not None:
            query = (
                "INSERT INTO users(username, password, balance, firstname, lastname, team_id) "
                "VALUES (:username, :password, 5000, :firstname, :lastname, :team_id)"
            )
            values = {
                "username": user.username,
                "password": hashed.decode("utf-8"),
                "firstname": user.firstname,
                "lastname": user.lastname,
                "team_id": user.team_id,
            }
        else:
            query = (
                "INSERT INTO users(username, password, balance, firstname, lastname) "
                "VALUES (:username, :password, 5000, :firstname, :lastname)"
            )
            values = {
                "username": user.username,
                "password": hashed.decode("utf-8"),
                "firstname": user.firstname,
                "lastname": user.lastname,
            }

        await database.execute(query, values)
        return {"userCreated": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Internal server error")


@app.post("/api/updatePassword")
async def update_password(
    payload: dict, token: str = Depends(authUtils.validate_access_token)
):
    try:
        hashed = bcrypt.hashpw(
            bytes(payload["password"], encoding="utf-8"), bcrypt.gensalt()
        )

        await database.execute(
            "UPDATE users SET password = :password WHERE user_id = :user_id",
            {"password": hashed.decode("utf-8"), "user_id": int(token["user_id"])},
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Something wrong. Could not update password"
        )
