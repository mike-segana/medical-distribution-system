from pydantic import BaseModel
from typing import Optional

class VitalsCreate(BaseModel):
    patient_id: int
    heart_rate: float
    spo2: float
    respiratory_rate: float
    mean_bp: float

class VitalsUpdate(BaseModel):
    heart_rate: float
    spo2: float
    respiratory_rate: float
    mean_bp: float

    class Config:
        orm_mode = True

class VitalsOut(BaseModel):
    id: int
    heart_rate: float
    spo2: float
    respiratory_rate: float
    mean_bp: float
    risk_level: str

    class Config:
        orm_mode = True