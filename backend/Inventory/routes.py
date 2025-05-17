from fastapi import HTTPException, APIRouter, status, Depends
from Inventory.dependencies import db_dependency, get_admin_user
from Inventory.models import Inventory
from Inventory.schemas import InventoryCreate, InventoryOut, InventoryUpdate
from Requests.models import Request, RequestStatus

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.post("/", response_model=InventoryOut)
def create_item(item: InventoryCreate, db: db_dependency, user=Depends(get_admin_user)):
    existing_item = db.query(Inventory).filter(Inventory.name == item.name).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Item already exists")
    new_item = Inventory(**item.model_dump(), isDeleted=False)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/", response_model=list[InventoryOut])
def list_items(db: db_dependency):
    return db.query(Inventory).filter(Inventory.isDeleted == False).all()

@router.put("/{item_id}", response_model=InventoryOut)
def update_item(item_id: int, item: InventoryUpdate, db: db_dependency, user=Depends(get_admin_user)):
    db_item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item.model_dump(exclude_unset=True)
    if "name" in update_data:
        existing_item = db.query(Inventory).filter(
            Inventory.name == update_data["name"],
            Inventory.id != item_id
        ).first()
        if existing_item:
            raise HTTPException(status_code=400, detail="Another item with that name already exists")
    for field, value in update_data.items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: db_dependency, user=Depends(get_admin_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    any_requests = db.query(Request).filter(Request.inventory_id == item.id).all()
    if not any_requests:
        db.delete(item)
        db.commit()
        return {"message": "Item deleted successfully"}
    pending = any(r.status == RequestStatus.pending for r in any_requests)
    if pending:
        raise HTTPException(status_code=400, detail="Cannot delete item: Pending requests must be handled first")
    item.isDeleted = True
    db.commit()
    return {"message": "Item set to deleted"}
