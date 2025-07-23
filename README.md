# Emotion Detection Web App

This is a simple web application that predicts emotions from speech using a Random Forest machine learning model. It has a FastAPI backend, a plain HTML/CSS/JS frontend, and uses Librosa to extract audio features from `.wav` files.

## Features

- Upload a `.wav` audio file  
- Backend extracts features using Librosa  
- Trained Random Forest model returns an emotion prediction  
- Simple, lightweight frontend interface

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** FastAPI (Python)  
- **Machine Learning:** scikit-learn (RandomForestClassifier)  
- **Audio Processing:** Librosa

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/samitsinghbag/emotion-detection.git
cd emotion-detection
````

### 2. Set up the backend

Make sure Python 3.8+ is installed.

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn main:app --reload
```

This will start the backend at `http://localhost:8000`

### 3. Open the frontend

Open the `index.html` file in your browser. The frontend will make requests to the FastAPI backend running locally.

## File Structure

```
emotion-detection/
├── emotion-model.pkl      # Trained Random Forest model
├── main.py                # FastAPI backend
├── index.html             # Frontend HTML
├── styles.css             # Frontend styling
├── script.js              # Frontend JS logic
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## Notes

* Only `.wav` audio files are supported for input.
* Make sure `emotion-model.pkl` is in the same directory as `main.py`.
* The backend extracts features from audio using Librosa and passes them to the trained model.
* The frontend expects the backend to be running on `localhost:8000`.

## Author

Built by [@samitsinghbag](https://github.com/samitsinghbag)

