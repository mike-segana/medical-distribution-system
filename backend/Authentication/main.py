from fastapi import FastAPI, status, Depends, HTTPException
import models
from database import engine, SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session
import auth

app = FastAPI()

#creating database tables if they dont already exist
models.Base.metadata.create_all(bind=engine)

#including the authentication router
app.include_router(auth.router)