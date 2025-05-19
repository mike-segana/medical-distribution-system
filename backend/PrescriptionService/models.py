from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.dialects.postgresql import ARRAY

class Symptom(Base):
    __tablename__ = "symptoms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class PatientSymptom(Base):
    __tablename__ = "patient_symptoms"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    symptoms = Column(ARRAY(String))

class PatientPrescription(Base):
    __tablename__ = "patient_prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    prescriptions = Column(ARRAY(String))
    flagged = Column(Integer, default=0)
    prescribed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prescribed_by = relationship("Users", backref="prescriptions_made")