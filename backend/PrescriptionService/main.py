from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from database import Base, engine, SessionLocal
from PrescriptionService.routes import router
from PrescriptionService.models import Symptom, Prescription
from PrescriptionService.constants.symptoms import SYMPTOM_ID_TO_NAME
from PrescriptionService.constants.prescriptions import PRESCRIPTION_ID_TO_NAME

load_dotenv()

Base.metadata.create_all(bind=engine)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = SessionLocal()
    try:
        for name in SYMPTOM_ID_TO_NAME.values():
            if not db.query(Symptom).filter_by(name=name).first():
                db.add(Symptom(name=name))

        for name in PRESCRIPTION_ID_TO_NAME.values():
            if not db.query(Prescription).filter_by(name=name).first():
                db.add(Prescription(name=name))

        db.commit()
    finally:
        db.close()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)