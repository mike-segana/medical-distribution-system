from pydantic import BaseModel
from typing import Optional
from enum import Enum

class RequestStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"

class RequestCreate(BaseModel):
    inventory_id: int
    quantity: int

class RequestUpdate(BaseModel):
    quantity: Optional[int]

class InventoryItem(BaseModel):
    name: str

    class Config:
        orm_mode = True

class RequestOut(BaseModel):
    id: int
    user_id: int
    inventory_id: int
    quantity: int
    status: RequestStatus
    inventory: InventoryItem

    class Config:
        orm_mode = True
