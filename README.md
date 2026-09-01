# SyncMasters: CPSE Material Intelligence Portal

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

*   **Intelligent File Ingestion Pipeline:** Upload CSV catalogs containing thousands of unstandardized raw material SKUs. The backend automatically parses, sanitizes, and prepares the data for AI evaluation.
*   **Vision AI OCR (Optical Character Recognition):** Upload raw PDFs, Purchase Orders (POs), or Invoices. The local Python AI Server utilizes `llama3.2-vision` to instantly extract materials, quantities, sizes, and vendor names, standardizing them before they even hit the database.
*   **Semantic AI Matcher:** Powered by an autonomous AI agent, the platform compares newly uploaded CPSE items against the Master Data dictionary. It assigns confidence scores and instantly flags identical items (e.g., matching a "VLV GT CS 4IN" from ONGC with a "Gate Valve 4 inch Carbon Steel" from IOCL).
*   **GovTech Analytics Dashboard:** A live React-based dashboard calculating real-time Estimated INR Savings, Harmonization Rates, and mapping counts. Features interactive pie charts, recent audit logs, and approval pipelines.
*   **Multi-Role Access Control (RBAC):** Different views and permissions for Central Ministry Admins (e.g., Ministry of Petroleum), QA Reviewers, and standard Procurement Officers.
*   **Secure & Air-Gapped Capable:** Designed to run entirely in-house. The AI Orchestrator runs locally via Python and FastAPI, guaranteeing that sensitive government procurement data is never sent to public LLMs.

---

## 🏗️ Deep-Dive Technical Stack

### 1. Frontend Architecture (React + Vite)
*   **Core Framework:** React 18 bundled via Vite for lightning-fast HMR and optimal build sizes.
*   **Styling:** Tailwind CSS integrated with custom CSS variables to match strict GovTech accessibility standards (high contrast, clear typography).
*   **Icons & UI:** Lucide React for consistent vector iconography.
*   **Routing:** React Router DOM for seamless Single Page Application (SPA) navigation.
*   **Deployment:** Cloudflare Pages with CI/CD integration.

### 2. Backend Cloud API (Cloudflare Workers)
*   **Serverless Edge Runtime:** Hosted entirely on Cloudflare Workers (V8 Isolates) ensuring zero cold-starts and ultra-low latency API responses worldwide.
*   **Framework:** Hono (an ultrafast web framework designed specifically for Edge environments).
*   **Database:** Cloudflare D1 (Serverless SQL Database based on SQLite). Highly performant for read-heavy operations like dashboard analytics.
*   **Authentication:** Custom JWT-based middleware ensuring strict RBAC (Role-Based Access Control).
*   **Module System:** Pure ES Modules (`import`/`export`) for modern, tree-shakeable JavaScript.

### 3. AI Orchestrator Swarm (Python Local Server)
*   **API Server:** FastAPI running on Uvicorn for asynchronous, high-throughput Python API requests.
*   **AI Models:** Local instance of Ollama running `llama3.2` (Text) and `llama3.2-vision` (Image/PDF Extraction).
*   **Multi-Agent Swarm Logic:** Custom Python agents route traffic intelligently:
    *   **MDM Engineer Agent:** Cleans and standardizes raw text inputs into strict JSON schemas.
    *   **Vision OCR Agent:** Processes Base64 encoded PDFs/Images to extract vendor specifications.
    *   **RAG Librarian Agent:** Handles complex search queries across the material database.
*   **PDF Generation:** `reportlab` dynamically generates official Government Compliance Reports with embedded charts and tables.

---


## 🔑 Demo Accounts

To easily test the platform's Role-Based Access Control (RBAC) after setting it up locally, use the following pre-configured demo accounts. All accounts use the same default password: **`changeme123`**

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **Central Ministry Admin** | `admin@cpse.gov.in` | Full access. Can view the analytics dashboard, orchestrate AI, and manage all CPSEs. |
| **QA Reviewer** | `reviewer@cpcl.co.in` | Quality Assurance access. Can manually approve or reject semantic AI matches. |
| **Procurement Officer** | `store.officer@iocl.co.in` | Standard access. Can upload new raw material catalogs and view harmonized master data. |

---

## 🛠️ Complete Local Setup & Execution Instructions

### Prerequisites
*   **Node.js** (v18+)
*   **Python** (3.10+)
*   **Ollama** installed locally with the `llama3.2-vision` and `llama3.2` models pulled (`ollama run llama3.2-vision`).
*   **Wrangler CLI** (`npm install -g wrangler`) for Cloudflare database management.

### Step 1: Clone the Repository
```bash
git clone https://github.com/coderaarav12/SIH2026.git
cd SIH2026
```

### Step 2: Configure the Cloudflare Backend (API)
1. Navigate to the backend directory:
   ```bash
   cd Backend
   npm install
   ```
2. Set up your local Cloudflare D1 Database and get your `database_id`. Update the `wrangler.toml` file with your specific ID.
3. Apply the database schema:
   ```bash
   npx wrangler d1 execute material_intelligence_db --local --file=./db/schema.sql
   npx wrangler d1 execute material_intelligence_db --local --file=./db/seed.sql
   ```
4. Start the Edge API:
   ```bash
   npm run dev
   ```

### Step 3: Configure the Local AI Orchestrator (Python)
1. Open a new terminal and navigate to the AI backend:
   ```bash
   cd ai_backend
   ```
2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn pydantic requests reportlab
   ```
3. Start the AI Swarm:
   ```bash
   python server.py
   ```
*(The server will run on `http://localhost:8000`. You can optionally use `ngrok http 8000` to expose this to a deployed frontend).*

### Step 4: Start the React Frontend
1. Open a third terminal and navigate to the frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the `frontend` folder and link it to your backend:
   ```env
   VITE_API_URL=http://localhost:8787
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 👥 Contributors

This platform was built by the **SyncMasters** team:

*   [**Aarav Goel**](https://github.com/coderaarav12) - Collaborator
*   [**Amitabh Ghosh**](https://github.com/amitabhghosh1527) - Collaborator
*   [**Priyanshu Mishra**](https://github.com/pm5120-alt) - Collaborator
*   [**Kumar Harshvardhan Jaytri**](https://github.com/sussy-snake) - Collaborator
*   **Prachi** - Collaborator
*   **Prakul** - Collaborator

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and how to submit pull requests to the project.

## 🛡️ Security

This software has been specifically engineered with Government Data Sovereignty in mind. Please refer to our [SECURITY.md](SECURITY.md) for responsible vulnerability reporting guidelines.

## 📄 License

Copyright (c) 2026 SyncMasters. All Rights Reserved.
Unauthorized copying, modification, or distribution of this software is strictly prohibited. See the [LICENSE](LICENSE) file for full details.
