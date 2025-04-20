import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#loading environment variables from .env
load_dotenv()

#datebase url from .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

#creating an engine that connects to the database
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#manages database interaction such as this can commits and query are explicit not automatic
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#base class for defining orm models
Base = declarative_base()