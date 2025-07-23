import os
import numpy as np
import librosa
import joblib
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import soundfile as sf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("emotion_model.pkl")

SAMPLE_RATE = 22050
N_MFCC = 40
recent_logs = []

def extract_features(file_path):
    try:
        y, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
        return np.mean(mfcc.T, axis=0)
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
            temp.write(await file.read())
            temp_path = temp.name
    except Exception as e:
        print(f"Failed to save temp file: {e}")
        return JSONResponse({"error": "Internal server error"}, status_code=500)

    features = extract_features(temp_path)
    os.remove(temp_path)

    if features is None:
        return JSONResponse({"error": "Failed to extract features"}, status_code=500)

    try:
        prediction_proba = model.predict_proba([features])[0]
        predicted_index = np.argmax(prediction_proba)
        predicted_emotion = model.classes_[predicted_index]
        confidence = float(prediction_proba[predicted_index])
    except Exception as e:
        print(f"Model prediction error: {e}")
        return JSONResponse({"error": "Model prediction failed"}, status_code=500)

    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "emotion": predicted_emotion,
        "confidence": confidence
    }
    recent_logs.append(log_entry)

    return JSONResponse({
        "emotion": predicted_emotion,
        "confidence": confidence,
        "model": "Custom RandomForest"
    })

@app.get("/logs")
def get_logs(limit: int = 5):
    return {"logs": recent_logs[-limit:]}
