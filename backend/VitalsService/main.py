from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from VitalsService.vitals import router
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
