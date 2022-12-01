import bcrypt

user = {"password": "HelloWorld"}

userWrongPass = {"password": "helloworld"}

hashed = bcrypt.hashpw(bytes(user["password"], encoding="utf-8"), bcrypt.gensalt())
print(hashed)

if bcrypt.checkpw(bytes(userWrongPass["password"], encoding="utf-8"), hashed):
    print("It Matches!")
else:
    print("It Does not Match :(")
