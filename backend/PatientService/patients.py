from fastapi import APIRouter, Depends, HTTPException, status
from models import Patient, Users
from database import SessionLocal
from sqlalchemy.orm import Session, joinedload
from Dashboard.dependencies import get_current_user, db_dependency
from PatientService.schemas import PatientCreate, PatientUpdate, PatientOut
from typing import List
from BlockchainLogger.logger import log_operation
from models import Vitals
from PrescriptionService.models import PatientPrescription

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", status_code=201)
def create_patient(patient: PatientCreate, db: db_dependency, user=Depends(get_current_user)):
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can add patients.")
    if db.query(Patient).filter(Patient.email == patient.email).first():
        raise HTTPException(status_code=400, detail="Patient with this email already exists")
    
    doctor_id = user["id"]
    new_patient = Patient(
        first_name=patient.first_name,
        last_name=patient.last_name,
        age=patient.age,
        gender=patient.gender,
        email=patient.email,
        phone=patient.phone,
        user_id=current_user.id
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    log_operation(doctor_id, new_patient.id, "CREATE_PATIENT")
    return {"message": "Patient added", "patient_id": new_patient.id}

@router.get("/", response_model=List[PatientOut])
def get_my_patients(db: db_dependency, user=Depends(get_current_user)):
    patients = db.query(Patient).filter(Patient.user_id == user["id"]).all()
    result = []

    for patient in patients:
        latest_prescription = (
            db.query(PatientPrescription)
            .filter(PatientPrescription.patient_id == patient.id)
            .order_by(PatientPrescription.id.desc()) 
            .first()
        )
        latest_vitals = (
            db.query(Vitals)
            .filter(Vitals.patient_id == patient.id)
            .order_by(Vitals.id.desc())
            .first()
        )

        flag_status = "unassigned"
        if latest_prescription:
            if latest_prescription.flagged == 1:
                flag_status = "Flagged"
            elif latest_prescription.flagged == 0:
                flag_status = "Accepted"

        patient_dict = {
            "id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "age": patient.age,
            "gender": patient.gender,
            "email": patient.email,
            "phone": patient.phone,
            "risk_level": latest_vitals.risk_level if latest_vitals else "unassigned",
            "flag_status": flag_status,
        }
        result.append(patient_dict)

    return result

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, patient_data: PatientUpdate, db: db_dependency, user=Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == user["id"]).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
    
    for field, value in patient_data.dict(exclude_unset=True).items():
        setattr(patient, field, value)

    doctor_id = user["id"]
    db.commit()
    db.refresh(patient)
    log_operation(doctor_id, patient_id, "UPDATE_PATIENT")
    return patient

@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: db_dependency, user=Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == user["id"]).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")
    
    doctor_id = user["id"]
    db.delete(patient)
    db.commit()
    log_operation(doctor_id, patient_id, "DELETE_PATIENT")
    return {"message": "Patient deleted"}

@router.get("/all", response_model=List[PatientOut])
def get_all_patients(db: db_dependency, user=Depends(get_current_user)):
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    patients = db.query(Patient).all()
    result = []

    for patient in patients:
        latest_vitals = (
            db.query(Vitals)
            .filter(Vitals.patient_id == patient.id)
            .order_by(Vitals.id.desc())
            .first()
        )

        result.append({
            "id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "age": patient.age,
            "gender": patient.gender,
            "email": patient.email,
            "phone": patient.phone,
            "risk_level": latest_vitals.risk_level if latest_vitals else None,
            "flag_status": "Flagged" if getattr(latest_vitals, "flag_status", None) == 1 else "Accepted" if getattr(latest_vitals, "flag_status", None) == 0 else None,
        })

    return result