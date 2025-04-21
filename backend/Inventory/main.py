from fastapi import FastAPI
from Inventory.routes import router as inventory_router
from database import Base, engine
from Inventory import models

app = FastAPI(title="Inventory")

Base.metadata.create_all(bind=engine)

app.include_router(inventory_router)
