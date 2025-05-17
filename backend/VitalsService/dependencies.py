from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated
from jose import JWTError, jwt
from database import SessionLocal
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
AUTH_TOKEN_URL = os.getenv("AUTH_TOKEN_URL")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=AUTH_TOKEN_URL)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        username = payload.get("username")
        role = payload.get("role")

        if user_id is None or username is None:
            raise HTTPException(status_code=401, detail="Invalid user")
        
        return {"id": user_id, "username": username, "role": role}
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
