import os
import joblib
from dotenv import load_dotenv
import numpy as np
import pandas as pd

load_dotenv()

MODEL_PATH = os.getenv("VITAL_MODEL_PATH")
SCALER_PATH = os.getenv("VITAL_SCALER_PATH")

if not MODEL_PATH or not SCALER_PATH:
    raise RuntimeError("Model or Scaler path is not set in .env")

vital_model = joblib.load(MODEL_PATH)
vital_scaler = joblib.load(SCALER_PATH)

def predict_risk_level(features_df: pd.DataFrame) -> str:
    scaled = vital_scaler.transform(features_df)
    prediction = vital_model.predict(scaled)[0]
    return prediction
