from random import random
import os
from passlib.context import CryptContext
from jose import jwt
from jose.exceptions import JOSEError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import bcrypt
from .credentials import Credentials

SECRET = Credentials.secret
ALGORITHM = Credentials.algorithm


class AuthUtils:
    """Token needs to implement exp date"""

    def __init__(self):
        self.JWT_ALGORITHM = ALGORITHM
        self.JWT_SECRET_KEY = SECRET

    async def create_hashed_password(self, password: str) -> str:
        bcrypt.hashpw(bytes(password, encoding="utf-8"), bcrypt.gensalt())
        return self.password_context.hash(password)

    async def verify_password(self, password: str, user_pass: str) -> bool:
        verified = bcrypt.checkpw(password.encode("utf-8"), user_pass.encode("utf-8"))
        if verified:
            return True
        else:
            return False

    async def create_access_token(self, user: str, user_id: int) -> str:
        to_encode = {"user": user, "user_id": user_id}
        encoded_jwt = jwt.encode(to_encode, self.JWT_SECRET_KEY, self.JWT_ALGORITHM)
        return encoded_jwt

    async def validate_access_token(
        self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
    ):
        token = credentials.credentials

        try:
            payload = jwt.decode(
                token, self.JWT_SECRET_KEY, algorithms=[self.JWT_ALGORITHM]
            )

            print("payload: ", payload)
        except JOSEError as e:
            raise HTTPException(status_code=401, detail=str(e))
        return payload


authUtils = AuthUtils()
