from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pyod.models.iforest import IForest
import pandas as pd
import numpy as np
import uvicorn

app = FastAPI(title="PDS Anomaly Detection AI")

# Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OrderData(BaseModel):
    id: str  # e.g., order timestamp or hash to uniquely identify
    shop_id: int
    total_quantity: int
    item_count: int
    hour_of_day: int

@app.get("/")
def health_check():
    return {"status": "AI Engine is running", "model": "Isolation Forest"}

@app.post("/detect")
def detect_anomaly(data: list[OrderData]):
    """
    Detects if any of the recent orders are anomalous using Isolation Forest and Rules.
    Features: total_quantity, item_count, hour_of_day
    """
    if not data:
        return {"anomalies": []}
        
    df = pd.DataFrame([d.dict() for d in data])
    
    results = []
    
    # Train Isolation Forest dynamically on the incoming batch + synthetic baseline
    # In a real app, you would load a pre-trained model.
    # We add some synthetic "normal" data to help the model if batch is small.
    synthetic_normal = pd.DataFrame({
        'total_quantity': np.random.randint(1, 20, size=50),
        'item_count': np.random.randint(1, 5, size=50),
        'hour_of_day': np.random.randint(8, 20, size=50) # Normal hours 8am - 8pm
    })
    
    train_df = pd.concat([df[['total_quantity', 'item_count', 'hour_of_day']], synthetic_normal])
    
    model = IForest(contamination=0.1, random_state=42)
    X_train = train_df.values
    model.fit(X_train)
    
    # Predict on actual data
    X_test = df[['total_quantity', 'item_count', 'hour_of_day']].values
    preds = model.predict(X_test)
    scores = model.decision_function(X_test)
    
    for i, row in df.iterrows():
        is_anom = False
        reason = "Clean"
        score = float(scores[i])
        
        # ML Prediction
        if preds[i] == 1:
            is_anom = True
            reason = "Statistically unusual pattern detected by AI"
            
        # Hard Rule Overrides (captures obvious fraud even if ML misses it)
        if row['total_quantity'] > 100:
            is_anom = True
            reason = "Suspiciously high quantity (>100)"
        elif row['hour_of_day'] < 6 or row['hour_of_day'] > 22:
            is_anom = True
            reason = f"Unusual ordering hour ({row['hour_of_day']}:00)"
        elif row['item_count'] > 10:
            is_anom = True
            reason = "Excessive number of unique items"
            
        results.append({
            "id": row['id'],
            "shop_id": row['shop_id'],
            "is_anomaly": is_anom,
            "anomaly_score": round(score, 3),
            "reason": reason
        })
        
    return {"anomalies": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
