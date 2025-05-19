from fastapi import APIRouter, Depends, HTTPException
from models import Vitals, Patient
from sqlalchemy.orm import Session
from VitalsService.ml_model import predict_risk_level
from VitalsService.schemas import VitalsCreate, VitalsOut, VitalsUpdate
from Dashboard.dependencies import get_current_user, db_dependency
import pandas as pd
from BlockchainLogger.logger import log_operation

router = APIRouter(prefix="/vitals", tags=["vitals"])

@router.post("/", status_code=201)
def add_vitals(vitals: VitalsCreate, db: db_dependency, user=Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == vitals.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.user_id != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to add vitals for this patient")

    existing = db.query(Vitals).filter(Vitals.patient_id == patient.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vitals already exist for this patient. Use update instead.")

    features = pd.DataFrame([{
        "age": patient.age,
        "sex": 1 if patient.gender.lower() == "male" else 0,
        "Solar8000/HR": vitals.heart_rate,
        "Solar8000/PLETH_SPO2": vitals.spo2,
        "Solar8000/RR_CO2": vitals.respiratory_rate,
        "Solar8000/NIBP_MBP": vitals.mean_bp
    }])
    prediction = predict_risk_level(features)

    new_vitals = Vitals(
        patient_id=patient.id,
        heart_rate=vitals.heart_rate,
        spo2=vitals.spo2,
        respiratory_rate=vitals.respiratory_rate,
        mean_bp=vitals.mean_bp,
        risk_level=prediction
    )
    doctor_id = user["id"]
    db.add(new_vitals)
    db.commit()
    log_operation(doctor_id, patient.id, "ADD_VITALS")
    return {"message": "Vitals added", "risk_level": prediction}

@router.get("/patient/{patient_id}", response_model=list[VitalsOut])
def get_patient_vitals(patient_id: int, db: db_dependency, user=Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.user_id != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to view vitals for this patient")

    vitals = db.query(Vitals).filter(Vitals.patient_id == patient_id).all()
    return vitals

@router.put("/{patient_id}", response_model=VitalsOut, status_code=200)
def update_vitals(patient_id: int, vitals: VitalsUpdate, db: db_dependency, user=Depends(get_current_user)):
    existing_vitals = db.query(Vitals).filter(Vitals.patient_id == patient_id).first()
    if not existing_vitals:
        raise HTTPException(status_code=404, detail="Vitals not found for the given ID")

    patient = db.query(Patient).filter(Patient.id == existing_vitals.patient_id).first()
    if not patient or patient.user_id != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to update vitals for this patient")

    existing_vitals.heart_rate = vitals.heart_rate or existing_vitals.heart_rate
    existing_vitals.spo2 = vitals.spo2 or existing_vitals.spo2
    existing_vitals.respiratory_rate = vitals.respiratory_rate or existing_vitals.respiratory_rate
    existing_vitals.mean_bp = vitals.mean_bp or existing_vitals.mean_bp

    features = pd.DataFrame([{
        "age": patient.age,
        "sex": 1 if patient.gender.lower() == "male" else 0,
        "Solar8000/HR": existing_vitals.heart_rate,
        "Solar8000/PLETH_SPO2": existing_vitals.spo2,
        "Solar8000/RR_CO2": existing_vitals.respiratory_rate,
        "Solar8000/NIBP_MBP": existing_vitals.mean_bp
    }])
    existing_vitals.risk_level = predict_risk_level(features)
    doctor_id = user["id"]
    db.commit()
    db.refresh(existing_vitals)
    log_operation(doctor_id, patient.id, "UPDATE_VITALS")
    return existing_vitals

@router.get("/high-risk", status_code=200)
def get_high_risk_patients(db: db_dependency, user=Depends(get_current_user)):
    high_risk = (
        db.query(Patient, Vitals)
        .join(Vitals, Vitals.patient_id == Patient.id)
        .filter(Patient.user_id == user["id"], Vitals.risk_level == "High")
        .all()
    )

    results = []
    for patient, vitals in high_risk:
        results.append({
            "id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "age": patient.age,
            "gender": patient.gender,
            "heart_rate": vitals.heart_rate,
            "spo2": vitals.spo2,
            "respiratory_rate": vitals.respiratory_rate,
            "mean_bp": vitals.mean_bp,
            "risk_level": vitals.risk_level,
        })
    return results