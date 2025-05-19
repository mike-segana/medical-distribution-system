from pydantic import BaseModel
from typing import List, Optional

class SymptomCreate(BaseModel):
    name: str

class PrescriptionCreate(BaseModel):
    name: str

class AddSymptomsToPatient(BaseModel):
    symptom_ids: List[int]

class AddPrescriptionsToPatient(BaseModel):
    prescription_ids: List[int]

class PrescriptionFlagResponse(BaseModel):
    flagged: int
    message: str

class SymptomOut(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class PrescriptionOut(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class PatientPrescriptionOut(BaseModel):
    prescription_id: int
    prescribed_by_id: int
    flagged: int

    class Config:
        orm_mode = True
