import os
import joblib
import numpy as np
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.getenv("PRESCRIPTION_MODEL_PATH")
MLB_PATH = os.getenv("PRESCRIPTION_ENCODER_PATH")
FEATURES_PATH = os.getenv("PRESCRIPTION_FEATURES_PATH")

classifier = joblib.load(MODEL_PATH)
mlb = joblib.load(MLB_PATH)
feature_cols = joblib.load(FEATURES_PATH)

def preprocess_input(symptom_dict, prescription_list):
    symptom_features = [symptom_dict.get(f, 0) for f in feature_cols]
    prescription_encoded = mlb.transform([prescription_list])[0].tolist()
    combined_features = np.array(symptom_features + prescription_encoded).reshape(1, -1)
    return combined_features

def predict_flag(symptom_dict, prescription_list):
    X_input = preprocess_input(symptom_dict, prescription_list)
    flag = classifier.predict(X_input)[0]
    return flag
