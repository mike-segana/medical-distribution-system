from sqlalchemy import Column, String, Integer, Boolean
from database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Integer)
    description = Column(String)
    isDeleted = Column(Boolean, default="False", nullable=False) 