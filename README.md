# 🛡️ CyberShield

**AI-powered fraud detection and transaction risk analysis.**

Built for the PSBs Hackathon (Bank of India × IIT Hyderabad).

CyberShield scores financial transactions for fraud risk, flags suspicious activity, and adds investigation context on top of the ML prediction. A single FastAPI application serves the REST API, runs the AI pipeline, stores results in SQLite, and hosts the web dashboard.


**Live demo:** 

---

## Features

- **Transaction scoring**: fraud probability from 0 (low risk) to 1 (high risk)
- **Risk classification**: transactions labelled `normal` or `suspicious`
- **AI investigation layer**: combines the ML prediction with retrieved fraud-pattern knowledge (RAG) to produce reasoning and a recommendation
- **Persistence**: every scored transaction is stored in SQLite
- **Alerts endpoint**: quickly list only the flagged transactions
- **Dashboard**: web UI served directly by FastAPI, no separate frontend server
- **Auto-generated API docs** via Swagger at `/docs`

---

## Architecture

```text
 Browser
    │
    ▼
 FastAPI application (single service)
    ├─ Static dashboard   (HTML / CSS / JS, served at /)
    ├─ REST API           (/transaction, /transactions, /alerts, ...)
    │        │
    │        ▼
    │   AI Pipeline
    │     ├─ ML prediction      (scikit-learn model)
    │     ├─ RAG retrieval      (fraud-pattern knowledge base)
    │     └─ AI investigation   (reasoning + recommendation)
    │
    └─ SQLite database
```

**Request flow:** transaction → feature preparation → ML model → fraud probability → risk classification → AI investigation → saved to DB → returned to client.

---

## Tech Stack

| Layer | Tools |
|---|---|
| Application | Python, FastAPI, Uvicorn |
| Database | SQLAlchemy, SQLite |
| ML | scikit-learn (Random Forest), Pandas, Joblib |
| AI pipeline | ML prediction, RAG retrieval, investigation layer |
| Dashboard | HTML, CSS, JavaScript (served via FastAPI `StaticFiles`) |

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
│   ├── main.py                  # FastAPI app, routes, serves the dashboard
│   ├── database.py              # DB engine / session
│   ├── model.py                 # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   └── ai_service.py            # bridge between API and AI pipeline
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── DataSet.csv
├── requirements.txt
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
pip install -r requirements.txt
```

> `scikit-learn` is pinned to `1.7.2` so it matches the version used to train `model.pkl`.

### 4. Run the app

```bash
uvicorn app.main:app --reload
```

| URL | Purpose |
|---|---|
| `http://127.0.0.1:8000` | Dashboard |
| `http://127.0.0.1:8000/docs` | Swagger UI |
| `http://127.0.0.1:8000/health` | Health check |

One command runs everything. The SQLite database (`cybershield.db`) is created automatically on first run, and the dashboard calls the API on the same origin, so no extra configuration is needed.

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

## Testing

Open the dashboard at `/`, or use Swagger at `/docs` in this order:

1. `GET /health`
2. `POST /transaction`
3. `GET /transactions`
4. `GET /alerts`

---

## Deployment

CyberShield deploys as a **single web service**, so the API and dashboard share one URL.

**Render** (or any Python host such as Railway):

| Setting | Value |
|---|---|
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Notes:
- Make sure `AI/ml/model.pkl` and the RAG knowledge base files are committed, since the service needs them at runtime.
- The dashboard uses relative API URLs, so nothing changes between local and deployed.
- On free hosting tiers the SQLite file is reset on each redeploy, so demo data should be seeded on startup.

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
| Prakrati Saxena| Backend, API, dashboard integration |
| Kumkum Nath| ML model, AI pipeline |

---


