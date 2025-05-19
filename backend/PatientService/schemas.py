from pydantic import BaseModel, EmailStr
from typing import Optional

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    age: int
    gender: str
    email: EmailStr
    phone: Optional[str] = None

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class PatientOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    age: int
    gender: str
    email: EmailStr
    phone: Optional[str]
    risk_level: Optional[str] = None
    flag_status: Optional[str] = None

    class Config:
        orm_mode = True