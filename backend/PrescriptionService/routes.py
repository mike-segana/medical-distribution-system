from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from PrescriptionService.dependencies import get_current_user, db_dependency
from PrescriptionService.schemas import (
    AddSymptomsToPatient, AddPrescriptionsToPatient, PrescriptionFlagResponse,
    SymptomOut, PrescriptionOut
)
from PrescriptionService.models import Symptom, Prescription, PatientSymptom, PatientPrescription
from models import Patient, Users
from BlockchainLogger.logger import log_operation
from PrescriptionService.ml_model import predict_flag, feature_cols
from typing import List
from PrescriptionService.constants.symptoms import SYMPTOM_ID_TO_NAME
from PrescriptionService.constants.prescriptions import PRESCRIPTION_ID_TO_NAME
from typing import Dict, Any

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

@router.get("/symptoms", response_model=List[SymptomOut])
def get_all_symptoms():
    return [{"id": i, "name": name} for i, name in SYMPTOM_ID_TO_NAME.items()]

@router.get("/prescriptions", response_model=List[PrescriptionOut])
def get_all_prescriptions():
    return [{"id": i, "name": name} for i, name in PRESCRIPTION_ID_TO_NAME.items()]

@router.post("/patients/{patient_id}/symptoms", status_code=201)
def add_symptoms_to_patient(patient_id: int, symptoms_data: AddSymptomsToPatient,
                            db: db_dependency, user=Depends(get_current_user)):
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can add symptoms.")
    
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    symptom_names = []
    for sid in symptoms_data.symptom_ids:
        symptom_name = SYMPTOM_ID_TO_NAME.get(sid)
        if not symptom_name:
            raise HTTPException(status_code=404, detail=f"Invalid symptom id {sid}")
        symptom_names.append(symptom_name)

    patient_symptoms = db.query(PatientSymptom).filter(PatientSymptom.patient_id == patient_id).first()
    if patient_symptoms:
        raise HTTPException(
            status_code=400,
            detail="Symptoms already assigned. Use update endpoint instead."
        )
    else:
        patient_symptoms = PatientSymptom(patient_id=patient_id, symptoms=symptom_names)
        db.add(patient_symptoms)

    db.commit()

    log_operation(user["id"], patient_id, "ADD_SYMPTOMS")
    return {"message": f"Symptoms updated for patient {patient_id}"}

@router.post("/patients/{patient_id}/prescriptions", status_code=201, response_model=PrescriptionFlagResponse)
def prescribe_to_patient(patient_id: int, prescription_data: AddPrescriptionsToPatient,
                         db: db_dependency, user=Depends(get_current_user)):
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can prescribe.")

    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    prescription_names = []
    for pid in prescription_data.prescription_ids:
        pname = PRESCRIPTION_ID_TO_NAME.get(pid)
        if not pname:
            raise HTTPException(status_code=404, detail=f"Invalid prescription id {pid}")
        prescription_names.append(pname)

    patient_prescriptions = db.query(PatientPrescription).filter(PatientPrescription.patient_id == patient_id).first()
    if patient_prescriptions:
        raise HTTPException(
            status_code=400,
            detail="Prescriptions already assigned. Use update endpoint instead."
        )
    else:
        patient_prescriptions = PatientPrescription(
            patient_id=patient_id,
            prescriptions=prescription_names,
            flagged=int(predict_flag({}, prescription_names)),
            prescribed_by_id=user["id"]
        )
        db.add(patient_prescriptions)

    db.commit()
    log_operation(user["id"], patient_id, "PRESCRIBE")
    flag = patient_prescriptions.flagged
    msg = "Prescription flagged" if flag == 1 else "Prescription accepted"
    return PrescriptionFlagResponse(flagged=flag, message=msg)

@router.put("/patients/{patient_id}/symptoms", status_code=200)
def update_patient_symptoms(patient_id: int, symptoms_data: AddSymptomsToPatient,
                            db: db_dependency, user=Depends(get_current_user)):
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can update symptoms.")

    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    symptom_names = []
    for sid in symptoms_data.symptom_ids:
        symptom_name = SYMPTOM_ID_TO_NAME.get(sid)
        if not symptom_name:
            raise HTTPException(status_code=404, detail=f"Invalid symptom ID {sid}")
        symptom_names.append(symptom_name)

    patient_symptoms = db.query(PatientSymptom).filter(PatientSymptom.patient_id == patient_id).first()
    if patient_symptoms:
        patient_symptoms.symptoms = symptom_names
    else:
        patient_symptoms = PatientSymptom(patient_id=patient_id, symptoms=symptom_names)
        db.add(patient_symptoms)

    db.commit()
    log_operation(user["id"], patient_id, "UPDATE_SYMPTOMS")
    return {"message": f"Symptoms updated for patient {patient_id}"}

@router.put("/patients/{patient_id}/prescriptions", status_code=200, response_model=PrescriptionFlagResponse)
def update_patient_prescriptions(
    patient_id: int,
    prescription_data: AddPrescriptionsToPatient,
    db: db_dependency,
    user=Depends(get_current_user)
):
 
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can update prescriptions.")

    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.user_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

    try:
        prescription_names = [PRESCRIPTION_ID_TO_NAME[pid] for pid in prescription_data.prescription_ids]
    except KeyError as e:
        raise HTTPException(status_code=404, detail=f"Invalid prescription ID: {e.args[0]}")
    flag_status = int(predict_flag({}, prescription_names))

    patient_prescription = db.query(PatientPrescription).filter(
        PatientPrescription.patient_id == patient_id
    ).first()

    if patient_prescription:
        patient_prescription.prescriptions = prescription_names
        patient_prescription.flagged = flag_status
        patient_prescription.prescribed_by_id = current_user.id
    else:
        new_entry = PatientPrescription(
            patient_id=patient_id,
            prescriptions=prescription_names,
            flagged=flag_status,
            prescribed_by_id=current_user.id
        )
        db.add(new_entry)

    db.commit()
    log_operation(current_user.id, patient_id, "UPDATE_PRESCRIPTIONS")

    msg = "Prescription flagged" if flag_status else "Prescription accepted"
    return PrescriptionFlagResponse(flagged=flag_status, message=msg)

@router.get("/patients/{patient_id}/records", status_code=200)
def get_patient_records(
    patient_id: int,
    db: db_dependency,
    user=Depends(get_current_user)
) -> Dict[str, Any]:
    
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can access patient records.")

    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.user_id == current_user.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized.")

    patient_symptoms = db.query(PatientSymptom).filter(
        PatientSymptom.patient_id == patient_id
    ).first()

    patient_prescription = db.query(PatientPrescription).filter(
        PatientPrescription.patient_id == patient_id
    ).first()

    return {
        "symptoms": patient_symptoms.symptoms if patient_symptoms else [],
        "prescriptions": {
            "names": patient_prescription.prescriptions if patient_prescription else [],
            "flagged": patient_prescription.flagged if patient_prescription else 0,
            "prescribed_by": patient_prescription.prescribed_by_id if patient_prescription else None
        }
    }

@router.get("/flagged-patients", status_code=200)
def get_flagged_patients(
    db: db_dependency,
    user=Depends(get_current_user)
):
    current_user = db.query(Users).filter(Users.id == user["id"]).first()
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only doctors can access flagged patients.")

    flagged = (
        db.query(Patient)
        .join(PatientPrescription, Patient.id == PatientPrescription.patient_id)
        .filter(Patient.user_id == current_user.id)
        .filter(PatientPrescription.flagged == 1)
        .all()
    )

    return [{
        "id": p.id,
        "name": f"{p.first_name} {p.last_name}",
        "age": p.age,
        "gender": p.gender
    } for p in flagged]