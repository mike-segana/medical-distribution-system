from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    inventory_id = Column(Integer, ForeignKey("inventory.id"))
    quantity = Column(Integer)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending)

    item_name = Column(String)
    inventory = relationship("Inventory", backref="requests")
