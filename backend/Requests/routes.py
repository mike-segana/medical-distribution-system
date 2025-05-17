from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Requests.models import Request, RequestStatus
from Inventory.models import Inventory
from Requests.schemas import RequestCreate, RequestOut, RequestUpdate
from Inventory.dependencies import db_dependency, get_current_user, get_admin_user

router = APIRouter(prefix="/requests", tags=["Requests"])

@router.get("/available-items")
def get_available_inventory_items(db: db_dependency):
    items = db.query(Inventory.id, Inventory.name, Inventory.quantity).filter(Inventory.isDeleted == False).all()
    return [{"id": i[0], "name": i[1], "quantity": i[2]} for i in items]

@router.post("/", response_model=RequestOut)
def create_request(request: RequestCreate, db: db_dependency, user=Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == request.inventory_id, Inventory.isDeleted == False).first()
    if not item or item.quantity < request.quantity:
        raise HTTPException(status_code=400, detail="Not enough inventory or item is no longer available")

    new_request = Request(
        user_id=user["id"],
        inventory_id=request.inventory_id,
        quantity=request.quantity,
        status=RequestStatus.pending,
        item_name=item.name
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/mine", response_model=list[RequestOut])
def get_my_requests(db: db_dependency, user=Depends(get_current_user)):
    return db.query(Request).filter(Request.user_id == user["id"]).all()

@router.get("/history", response_model=list[RequestOut])
def view_request_history(db: db_dependency, user=Depends(get_admin_user)):
    return db.query(Request).filter(Request.status != RequestStatus.pending).all()

@router.get("/pending", response_model=list[RequestOut])
def get_pending_requests(db: db_dependency, user=Depends(get_admin_user)):
    return db.query(Request).filter(Request.status == RequestStatus.pending).all()

@router.post("/{request_id}/accept")
def accept_request(request_id: int, db: db_dependency, user=Depends(get_admin_user)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req or req.status != RequestStatus.pending:
        raise HTTPException(status_code=404, detail="Invalid request")

    inventory_item = db.query(Inventory).filter(Inventory.id == req.inventory_id, Inventory.isDeleted == False).first()
    if not inventory_item or inventory_item.quantity < req.quantity:
        raise HTTPException(status_code=400, detail="Not enough inventory to fulfill request or item is no longer available")

    inventory_item.quantity -= req.quantity
    req.status = RequestStatus.accepted
    db.commit()
    return {"message": "Request accepted and inventory updated"}

@router.post("/{request_id}/decline")
def decline_request(request_id: int, db: db_dependency, user=Depends(get_admin_user)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req or req.status != RequestStatus.pending:
        raise HTTPException(status_code=404, detail="Invalid request")

    req.status = RequestStatus.declined
    db.commit()
    return {"message": "Request declined"}

@router.put("/{request_id}", response_model=RequestOut)
def update_request(request_id: int, update: RequestUpdate, db: db_dependency, user=Depends(get_current_user)):
    req = db.query(Request).filter(Request.id == request_id, Request.user_id == user["id"]).first()
    if not req or req.status != RequestStatus.pending:
        raise HTTPException(status_code=403, detail="Cannot update this request")

    if update.quantity:
        inventory_item = db.query(Inventory).filter(Inventory.id == req.inventory_id).first()
        if inventory_item.quantity < update.quantity:
            raise HTTPException(status_code=400, detail="Not enough inventory")
        req.quantity = update.quantity

    db.commit()
    db.refresh(req)
    return req

@router.delete("/{request_id}")
def delete_request(request_id: int, db: db_dependency, user=Depends(get_current_user)):
    req = db.query(Request).filter(Request.id == request_id, Request.user_id == user["id"]).first()
    if not req or req.status != RequestStatus.pending:
        raise HTTPException(status_code=403, detail="Cannot delete this request")
    db.delete(req)
    db.commit()
    return {"message": "Request deleted"}
