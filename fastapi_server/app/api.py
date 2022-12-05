from fastapi import HTTPException
from time import sleep
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from .postgresPool import pool
from string import Template
import bcrypt
from .auth_utils import authUtils
from psycopg2.extras import RealDictCursor


try:
    connection = pool.getconn()

except (Exception, psycopg2.DatabaseError) as error:
    print("Error while connecting to PostgreSQL", error)


def fetchDB(query):
    cursor = connection.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    return result


def fetchDBJson(query):
    cursor = connection.cursor(cursor_factory=RealDictCursor)
    cursor.execute(query)
    result = cursor.fetchall()
    return result


def insertDB(query):
    cursor = connection.cursor()
    cursor.execute(query)
    connection.commit()


# conn = psycopg2.connect(
# host=Credentials.host,
# database=Credentials.db,
# user=Credentials.user,
# password=Credentials.password,
# )
# # create a cursor
# cur = conn.cursor()


# # execute a statement
# print("PostgreSQL database version:")
# cur.execute("SELECT * from accounts;")

# # display the PostgreSQL database server version
# db_version = cur.fetchone()
# print(db_version)


app = FastAPI()

origins = ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your todo list."}


@app.get("/api/openbets")
async def read_root(token: str = Depends(authUtils.validate_access_token)) -> dict:
    bets = fetchDB("select * from bets where bet_status = 1")
    bets_with_options = []
    for bet in bets:
        bet_with_option = {
            "title": bet[2],
            "bet_status": bet[3],
            "bet_id": bet[0],
            "category": bet[1],
        }
        options = fetchDB(f"select * from bet_options where bet = {bet[0]}")
        options_list = []
        for option in options:
            option_dict = {
                "latest_odds": option[1],
                "option": option[3],
                "option_id": option[0],
                "option_status": option[2],
            }
            options_list.append(option_dict)
        bet_with_option["bet_options"] = options_list
        bets_with_options.append(bet_with_option)

    return bets_with_options


@app.get("/api/accums")
async def read_root(token: str = Depends(authUtils.validate_access_token)) -> dict:
    accums = fetchDB(
        f"select accum_id, stake, total_odds from accums where user_id={token['user_id']}"
    )
    accums_with_options = []
    for accum in accums:
        accum_dict = {"accum_id": accum[0], "stake": accum[1], "total_odds": accum[2]}
        accum_options = fetchDB(
            f"select bets.title, accum_options.user_odds, bet_options.option, bet_options.option_status from bet_options natural join accum_options left join bets on bet_options.bet = bets.bet_id inner join accums on accum_options.accum_id = accums.accum_id where accums.accum_id = {accum[0]};"
        )
        options_list = []
        for option in accum_options:
            option_dict = {
                "bet": option[0],
                "user_odds": option[1],
                "chosen_option": option[2],
                "option_status": option[3],
            }
            options_list.append(option_dict)
        accum_dict["accumBets"] = options_list
        accums_with_options.append(accum_dict)

    return accums_with_options


# @app.get("/admin/allaccums")
# async def read_root() -> dict:
#     return {"message": "Admin"}


@app.get("/api/userAvailability/{user}")
async def read_root(user: str) -> dict:
    res = fetchDB(f"select exists(select 1 from users where username = '{user}')")
    if res[0][0]:
        return {"userTaken": True}
    else:
        return {"userTaken": False}


@app.get("/api/login/")
async def add_user(user, password) -> dict:
    user_pass = fetchDB(
        Template(
            "select user_id, password from users where username = '$username'"
        ).safe_substitute({"username": user})
    )
    try:
        user_id = user_pass[0][0]
        user_pass = user_pass[0][1]

    except IndexError:
        return {"loggedIn": False}
    if bcrypt.checkpw(password.encode("utf-8"), user_pass.encode("utf-8")):
        jwt = await authUtils.create_access_token(user, user_id)
        return {"loggedIn": True, "jwt": jwt}
    else:
        return {"loggedIn": False}


@app.get("/api/login/details")
async def add_user(
    token: str = Depends(authUtils.validate_access_token_nowhitelist),
) -> dict:

    res = fetchDBJson(
        Template(
            "select username, balance, firstname, lastname, admin from users where username = '$username'"
        ).safe_substitute({"username": token["user"]})
    )
    return res


def is_admin(username):
    res = fetchDBJson(
        Template(
            "select admin from users where username = '$username'"
        ).safe_substitute({"username": username})
    )
    if res[0]["admin"]:
        return True
    else:
        return False


@app.get("/api/admin/getusers/")
async def get_users(token: str = Depends(authUtils.validate_access_token)) -> dict:

    if is_admin(token["user"]):
        res = fetchDBJson("select * from users")
        return res
    else:
        raise HTTPException(status_code=403, detail="You are not admin")


# {category: "string", title: "string", options: [{latest_odds: number, option: "string"}]}
@app.post("/api/admin/createbet/")
async def create_bet(
    bet: dict, token: str = Depends(authUtils.validate_access_token)
) -> dict:

    if is_admin(token["user"]):
        # create bet
        cursor = connection.cursor()
        query1 = Template(
            "insert into bets(category, title) values ('$category', '$title') RETURNING bet_id"
        ).safe_substitute(
            {
                "category": bet["category"],
                "title": bet["title"],
            }
        )
        cursor.execute(query1)
        id_of_bet = cursor.fetchone()[0]

        for option in bet["options"]:
            query2 = Template(
                "insert into bet_options(latest_odds, option, bet) values ($latest_odds, '$option', $bet)"
            ).safe_substitute(
                {
                    "latest_odds": float(option["latest_odds"]),
                    "option": option["option"],
                    "bet": id_of_bet,
                }
            )
            cursor.execute(query2)
        connection.commit()
        return {"createBet": True}
    else:
        return {"createBet": False, "errorMsg": "Du er ikke admin"}


@app.post("/api/placebet/")
async def place_bet(
    bet: dict, token: str = Depends(authUtils.validate_access_token)
) -> dict:
    print(bet["stake"])
    res = fetchDBJson(
        Template(
            "select balance from users where username = '$username'"
        ).safe_substitute({"username": token["user"]})
    )
    if res[0]["balance"] >= bet["totalodds"]:
        cursor = connection.cursor()
        query1 = Template(
            "insert into accums(stake, total_odds, user_id) values ($stake, $total_odds, $user_id) RETURNING accum_id"
        ).safe_substitute(
            {
                "stake": float(bet["stake"]),
                "total_odds": float(bet["totalodds"]),
                "user_id": int(token["user_id"]),
            }
        )
        cursor.execute(query1)
        id_of_new_accum = cursor.fetchone()[0]
        for option in bet["bets"]:
            print(bet)
            query = Template(
                "insert into accum_options(option_id, accum_id, user_odds) values ($option_id, $accum_id, $user_odds)"
            ).safe_substitute(
                {
                    "option_id": option["option"]["option_id"],
                    "accum_id": id_of_new_accum,
                    "user_odds": option["option"]["latest_odds"],
                }
            )
            cursor.execute(query)
        balance_query = Template(
            "update users set balance = balance - $stake where user_id = $user_id"
        ).safe_substitute(
            {"stake": float(bet["stake"]), "user_id": int(token["user_id"])}
        )
        cursor.execute(balance_query)
        connection.commit()
    else:
        return {
            "placeBet": False,
            "errorMsg": "Ikke nok penger på konto. Feil? Snakk med Lau",
        }

    return {"placeBet": True}


@app.post("/api/createUser")
async def add_user(user: dict) -> dict:

    hashed = authUtils.create_hashed_password(user["password"])

    res = insertDB(
        Template(
            "insert into users(username, password, balance, firstname, lastname) values ('$username', '$password', 1000, '$firstname', '$lastname')"
        ).safe_substitute(
            {
                "username": user["username"],
                "password": hashed.decode("utf-8"),
                "firstname": user["firstname"],
                "lastname": user["lastname"],
            }
        )
    )
    return {"userCreated": True}
