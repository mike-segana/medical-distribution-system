from fastapi import FastAPI
from database import Base, engine
from Requests.routes import router as request_router
from Requests import models

app = FastAPI(title="Requests")

Base.metadata.create_all(bind=engine)

app.include_router(request_router)
