# SyncMasters: CPSE Material Intelligence Portal

![Banner Placeholder](https://via.placeholder.com/1200x300.png?text=SyncMasters+CPSE+Material+Intelligence+Portal)

> **Award-Winning Scale Architecture built for the Smart India Hackathon (SIH) 2026**
> 
> *Ministry of Petroleum & Natural Gas*

---

## 📖 Overview

The **SyncMasters CPSE Material Intelligence Portal** is an advanced, full-stack GovTech platform engineered to solve a massive logistical challenge across India's Central Public Sector Enterprises (CPSEs).

When massive entities like ONGC, IOCL, GAIL, and CPCL procure raw materials, they often use entirely different nomenclature for the exact same physical items (e.g., "SS Hex Bolt" vs "Stainless Steel Hex Bolt"). This fragmentation prevents demand aggregation, blocks bulk purchasing discounts, and leads to millions of rupees in lost procurement efficiency.

This platform introduces an **AI-driven Orchestrator**, powered by local Llama 3.2 Vision models, to autonomously ingest, extract, standardize, and map thousands of raw materials across CPSEs into a single unified master database.

---

## 🚀 Key Features

*   **Intelligent File Ingestion Pipeline:**
    Upload CSV catalogs containing thousands of unstandardized raw material SKUs. The backend automatically parses, sanitizes, and prepares the data for AI evaluation.
*   **Vision AI OCR (Optical Character Recognition):**
    Upload raw PDFs, Purchase Orders (POs), or Invoices. The local Python AI Server utilizes `llama3.2-vision` to instantly extract materials, quantities, sizes, and vendor names, standardizing them before they even hit the database.
*   **Semantic AI Matcher:**
    Powered by an autonomous AI agent, the platform compares newly uploaded CPSE items against the Master Data dictionary. It assigns confidence scores and instantly flags identical items (e.g., matching a "VLV GT CS 4IN" from ONGC with a "Gate Valve 4 inch Carbon Steel" from IOCL).
*   **GovTech Analytics Dashboard:**
    A live React-based dashboard calculating real-time Estimated INR Savings, Harmonization Rates, and mapping counts. Features interactive pie charts, recent audit logs, and approval pipelines.
*   **Multi-Role Access Control (RBAC):**
    Different views and permissions for Central Ministry Admins (e.g., Ministry of Petroleum), QA Reviewers, and standard Procurement Officers.
*   **Secure & Air-Gapped Capable:**
    Designed to run entirely in-house. The AI Orchestrator runs locally via Python and FastAPI, guaranteeing that sensitive government procurement data is never sent to public LLMs.

---

## 🏗️ Architecture & Tech Stack

### 1. Frontend (User Interface)
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS + Lucide React Icons
*   **Deployment:** Cloudflare Pages (Configured)
*   **Highlights:** Responsive GovTech design, high-contrast tables, interactive OCR preview windows, and animated data flows.

### 2. Backend (Cloud API)
*   **Runtime:** Cloudflare Workers (Edge Computing)
*   **Database:** Cloudflare D1 (Serverless SQLite)
*   **Routing:** Hono framework
*   **Highlights:** Ultra-low latency, zero cold-starts, robust JWT authentication, and strict ES Module architecture.

### 3. AI Orchestrator (Python AI Server)
*   **Framework:** Python 3 + FastAPI
*   **AI Models:** Llama 3.2 Vision (via Ollama)
*   **Features:** Multi-Agent Swarm logic. Endpoints for `/api/vision/ocr` and `/api/standardize`.
*   **Highlights:** Extracts and structures data from images/PDFs. Fully capable of running on local GPUs to maintain data sovereignty.

---

## 🛠️ Project Structure

```text
SIH2026/
├── frontend/             # React/Vite Frontend Application
│   ├── src/              # React Components, Pages, and Hooks
│   └── package.json
├── Backend/              # Cloudflare Worker API
│   ├── routes/           # Hono API Routes (analytics, materials, ocr)
│   ├── services/         # Normalization & Matching Logic
│   └── wrangler.toml     # Cloudflare Edge Configuration
├── ai_backend/           # Python Local AI Server
│   ├── server.py         # FastAPI Entrypoint
│   └── orchestrator.py   # AI Swarm & Agent Logic
├── test_data/            # Sample CPSE Catalogs (CSV)
├── test_invoices/        # Mock Invoices/POs for OCR Demo
├── speaker/              # Presentation scripts and notes
├── SECURITY.md           # Security Policy
├── LICENSE               # Proprietary License
└── README.md             # This Documentation
```

---

## 💻 Local Setup & Execution

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   Ollama (with `llama3.2-vision` installed)

### 1. Start the AI Backend
Navigate to the `ai_backend` folder and start the FastAPI server:
```bash
cd ai_backend
python server.py
```
*(The server will run on `http://localhost:8000`)*

### 2. Start the Backend API (Local Cloudflare Env)
Open a new terminal, navigate to the `Backend` folder, and run the Wrangler development server:
```bash
cd Backend
npm install
npm run dev
```

### 3. Start the Frontend
Open a third terminal, navigate to the `frontend` folder, and start the React app:
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Security & Privacy

This software has been strictly designed with Government Data Sovereignty in mind. Please refer to the `SECURITY.md` file for vulnerability reporting guidelines.

## 📄 License

Copyright (c) 2026 SyncMasters. All Rights Reserved.
Unauthorized copying, modification, or distribution of this software is strictly prohibited. See the `LICENSE` file for full details.
