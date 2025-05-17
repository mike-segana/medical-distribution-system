from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")

    patients = relationship("Patient", back_populates="created_by")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String)
    last_name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    email = Column(String, unique=True)
    phone = Column(String, nullable=True)

    created_by = relationship("Users", back_populates="patients")
    vitals = relationship("Vitals", back_populates="patient", cascade="all, delete")


class Vitals(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    heart_rate = Column(Float)
    spo2 = Column(Float)
    respiratory_rate = Column(Float)
    mean_bp = Column(Float)
    risk_level = Column(String)

    patient = relationship("Patient", back_populates="vitals")
