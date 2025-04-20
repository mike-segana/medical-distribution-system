from fastapi import APIRouter, HTTPException, Depends, status
from Dashboard.dependencies import db_dependency, get_current_user
from models import Users

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/admin")
async def admin_dashboard(db: db_dependency, user=Depends(get_current_user)):
    db_user = db.query(Users).filter(Users.id == user["id"]).first()
    if db_user is None or db_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins Only")
    return {"message": f"Welcome admin {db_user.username}!"}

@router.get("/user")
async def user_dashboard(db: db_dependency, user=Depends(get_current_user)):
    db_user = db.query(Users).filter(Users.id == user["id"]).first()
    if db_user is None or db_user.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Users Only")
    return {"message": f"Welcome user {db_user.username}!"}