from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os
from google.oauth2 import id_token
from google.auth.transport import requests

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minha_chave_super_secreta_palieduca")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 dias

GOOGLE_CLIENT_ID = "685476211444-k1d51qlvic4n0sk8rq3h2o54rnikpbd1.apps.googleusercontent.com"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_google_token(token: str):
    try:
        # Verifica o token com o Google e garante que ele foi emitido para o nosso Client ID
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except ValueError:
        # Invalid token
        return None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
