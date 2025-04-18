from datetime import timedelta, datetime, timezone
from typing import Annotated, Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal
from models import Users
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from enum import Enum

#loading environment variables from .env file
load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

#for password hashing
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"

#pydantic data validation to test user on registration before submit to db
#min length 1 for testing not deployment
class CreateUserRequest(BaseModel):
    email: str = Field(..., min_length=7)
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)
    role: RoleEnum = RoleEnum.user

#need for user auth
class Token(BaseModel):
    access_token: str
    token_type: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency,
                      create_user_request: CreateUserRequest):
    existing_user = db.query(Users).filter(Users.username == create_user_request.username).first()
    existing_email = db.query(Users).filter(Users.email == create_user_request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already in use"
        )
    
    create_user_model = Users(
        email=create_user_request.email,
        username=create_user_request.username,
        hashed_password=bcrypt_context.hash(create_user_request.password),
        role=create_user_request.role
    )

    db.add(create_user_model)
    db.commit()

    return {"msg": "User created successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 Db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, Db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user')
    token = create_access_token(user.id, user.username, user.role, timedelta(minutes=20))
    return {'access_token': token, 'token_type': 'bearer'}

def authenticate_user(username: str, password: str, db):
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(user_id: int, username: str, role: str, expires_delta: timedelta):
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get('sub'))
        username: str = payload.get('username')

        if user_id is None or username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Could not validate user'
            )
        return {"id": user_id, "username": username}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate user'
        )
