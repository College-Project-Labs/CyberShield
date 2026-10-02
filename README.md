# 🛡️ CyberShield

**AI-powered fraud detection and transaction risk analysis.**

Built for the PSBs Hackathon (Bank of India × IIT Hyderabad).

CyberShield scores financial transactions for fraud risk, flags suspicious activity, and adds investigation context on top of the ML prediction. A FastAPI backend serves the model, stores results in SQLite, and feeds a web dashboard.

<!-- TODO: add a screenshot or GIF of the dashboard here -->
<!-- ![Dashboard](docs/dashboard.png) -->

**Live demo:** _add Vercel / deployed link here_

---

## Features

- **Transaction scoring**: fraud probability from 0 (low risk) to 1 (high risk)
- **Risk classification**: transactions labelled `normal` or `suspicious`
- **AI investigation layer**: combines the ML prediction with retrieved fraud-pattern knowledge (RAG) to produce reasoning and a recommendation
- **Persistence**: every scored transaction is stored in SQLite
- **Alerts endpoint**: quickly list only the flagged transactions
- **Dashboard**: static web UI that talks to the REST API
- **Auto-generated API docs** via Swagger at `/docs`

---

## Architecture

```text
 Web Frontend (HTML / CSS / JS)
            │  REST
            ▼
 FastAPI Backend ──────────► SQLite
            │
            ▼
 AI Pipeline
   ├─ ML prediction      (scikit-learn model)
   ├─ RAG retrieval      (fraud-pattern knowledge base)
   └─ AI investigation   (reasoning + recommendation)
```

**Request flow:** transaction → feature preparation → ML model → fraud probability → risk classification → AI investigation → saved to DB → returned to client.

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI, Uvicorn, SQLAlchemy, SQLite |
| ML | scikit-learn (Random Forest), Pandas, Joblib |
| AI pipeline | ML prediction, RAG retrieval, investigation layer |

---

## Project Structure

```text
CyberShield/
├── AI/
│   ├── pipeline.py              # orchestrates ML → RAG → investigation
│   ├── agent/
│   │   └── assistant.py         # investigation layer
│   ├── ml/
│   │   ├── train.py             # model training
│   │   ├── predict.py           # inference
│   │   └── model.pkl            # trained model
│   └── rag/
│       ├── retriever.py
│       └── knowledge_base/
│           └── fraud_patterns.txt
├── app/
│   ├── main.py                  # FastAPI app + routes
│   ├── database.py              # DB engine / session
│   ├── model.py                 # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   └── ai_service.py            # bridge between API and AI pipeline
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── DataSet.csv
└── README.md
```

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/College-Project-Labs/CyberShield.git
cd CyberShield
```

### 2. Create a virtual environment

```powershell
# Windows
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy pandas joblib scikit-learn==1.7.2
```

> `scikit-learn` is pinned to `1.7.2` so it matches the version used to train `model.pkl`.

### 4. Run the backend

```bash
uvicorn app.main:app --reload
```

| URL | Purpose |
|---|---|
| `http://127.0.0.1:8000` | API root |
| `http://127.0.0.1:8000/docs` | Swagger UI |
| `http://127.0.0.1:8000/health` | Health check |

The SQLite database (`cybershield.db`) is created automatically on first run.

### 5. Run the frontend

The frontend is static. Open `frontend/index.html` with **VS Code Live Server** (usually `http://127.0.0.1:5500/frontend/index.html`).

Make sure the API base URL in `frontend/app.js` points to your backend (`http://127.0.0.1:8000` locally).

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/transaction` | Score a transaction and store it |
| `GET` | `/transactions` | List stored transactions (by creation time) |
| `GET` | `/transactions/{transaction_id}` | Fetch one transaction |
| `GET` | `/alerts` | List suspicious transactions only |

### Example

```bash
curl -X POST http://127.0.0.1:8000/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "M123",
    "amount": 5000,
    "timestamp": "2026-10-02T15:00:00",
    "raw_payload": {}
  }'
```

The transaction is run through the AI pipeline, saved to SQLite, and returned with its fraud score and classification.

---

## Dataset & Model

- **Dataset:** `DataSet.csv`
- **Target column:** `F3924`
- **Model:** scikit-learn Random Forest, saved at `AI/ml/model.pkl`
- **Output:** fraud probability in `[0, 1]`

To retrain:

```bash
python AI/ml/train.py
```

---

## CORS

For local development the backend allows these origins:

```text
http://localhost:5173
http://localhost:5500
http://127.0.0.1:5500
```

Add your deployed frontend URL to the CORS config in `app/main.py` before deploying.

---

## Testing

Use Swagger at `/docs`, in this order:

1. `GET /health`
2. `POST /transaction`
3. `GET /transactions`
4. `GET /alerts`

---

## Deployment

- **Frontend:** deploy the `frontend/` folder as a static site (e.g. Vercel).
- **Backend:** needs a Python host (e.g. Render, Railway). Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Change the API base URL in `frontend/app.js` from `http://127.0.0.1:8000` to the deployed backend URL, and add the frontend origin to CORS.

---

## Roadmap

- Real-time transaction streaming
- SHAP-based explanations for each flagged transaction
- Anomaly detection (e.g. Isolation Forest) alongside the supervised model
- User behavioural profiling
- Authentication and role-based access
- Production database (PostgreSQL)
- Model monitoring and automated retraining

---

## Team

| Name | Role |
|---|---|
|PRAKRATI SAXENA| Backend, API, frontend integration |
| KUMKUM NATH | ML model, AI pipeline |

---


