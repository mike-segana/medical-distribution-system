from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security import OAuth2
from Dashboard.dashboard import router
import os
from dotenv import load_dotenv

load_dotenv()

class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(self, tokenUrl: str):
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl})
        super().__init__(flows=flows)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=os.getenv("AUTH_TOKEN_URL"))

app = FastAPI()
app.include_router(router)