from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from jose import jwt, JWTError
from database import SessionLocal
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=os.getenv("AUTH_TOKEN_URL"))

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        username: str = payload.get("username")
        if user_id is None or username is None:
            raise HTTPException(status_code=401, detail="Invalid user")
        return {"id": user_id, "username": username}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
