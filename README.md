# SIH 2026 - Material Intelligence

AI-Driven Standardisation and Harmonization of Material Codes Across CPSEs

## What Problem This Solves

CPSEs often buy, store, and track the same item using different names.

Example:
- `SS Bolt M10x50`
- `Stainless Steel Hex Bolt 10 mm x 50 mm`
- `Bolt, SS, 304, 10x50`

These all may refer to the same physical material, but the code system treats them as different items. That creates:
- duplicate codes
- bad search results
- inconsistent procurement
- poor inventory visibility
- weak traceability

## What We Are Building

Material Intelligence is a software platform that helps CPSEs:
- clean and standardize material names
- find duplicate or equivalent materials
- recommend one canonical code
- verify items using OCR/image evidence
- keep every human approval recorded

In simple words: it is a smart search and standardization system for material master data.

## High-Level Architecture

```text
Input Sources
CPSE Masters / CSV / ERP Export / Label Images
        |
        v
1. Ingestion Layer
   - upload files
   - extract records
   - read images
        |
        v
2. Normalization Layer
   - expand abbreviations
   - normalize units
   - clean punctuation
   - extract attributes
        |
        v
3. AI Matching Layer
   - embeddings
   - vector similarity search
   - rule-based checks
   - OCR/CV support
        |
        v
4. Decision Layer
   - confidence score
   - explanation text
   - human review if needed
        |
        v
5. Canonical Master Layer
   - one standard code
   - mapping from old codes
   - audit trail
```

## Detailed System Architecture

### 1. Frontend Layer

This is the website the user sees.

Users:
- procurement team
- store/inventory team
- quality team
- admin/reviewer

Main pages:
- login and role-based access
- upload material data
- search materials
- compare similar items
- review AI suggestions
- approve or reject matches
- dashboard for analytics
- audit/history page

Frontend responsibilities:
- show forms and tables
- send requests to backend
- display match results
- show charts and summary cards
- display review queue

Suggested technologies:
- React or plain HTML/CSS/JS
- Chart.js for graphs
- Data tables for comparison views
- Bootstrap/Tailwind for UI styling

### 2. Backend Layer

This is the brain of the system.

Backend responsibilities:
- login/register users
- accept uploaded CSV/Excel files
- validate incoming data
- normalize text and units
- generate embeddings
- search for similar records
- calculate confidence score
- save reviewer decisions
- expose analytics APIs
- maintain logs and audit history

Suggested stack:
- Node.js + Express for main APIs
- Python FastAPI for AI services

### 3. AI Matching Layer

This is the most important part.

What it does:
- understands material names semantically
- detects equivalent items written differently
- extracts attributes like size, grade, material type, and unit
- compares new records with old records
- ranks possible matches
- gives an explanation for the match

How it works:
1. The material description is converted into an embedding.
2. The embedding is compared against existing canonical materials.
3. Similar items are ranked.
4. Rule checks filter false matches.
5. High-confidence matches are recommended automatically.
6. Low-confidence matches go to human review.

Example:

```text
Input 1: Stainless Steel Hex Bolt M10 x 50 SS304
Input 2: SS Hex Bolt 10mm x 50mm Grade 304

Result: probable equivalent
Reason: same material type, same size, same grade
```

### 4. OCR / Computer Vision Layer

This layer is optional, but useful when images are available.

It can:
- read text from labels
- verify packaging or item tags
- compare OCR output with master data
- support physical item verification

Important note:
- OCR is not the only decision maker
- it acts as supporting evidence

### 5. Database Layer

The database stores all structured data.

Recommended database:
- SQLite for prototype/demo
- PostgreSQL if you want a stronger multi-user setup

Main tables:
- `users` - login and roles
- `materials` - canonical material master
- `material_attributes` - structured specs
- `match_candidates` - AI suggestion list
- `review_actions` - human decisions
- `source_mappings` - old code to new code mapping
- `audit_logs` - all actions and approvals

Why this matters:
- keeps data organized
- makes searching fast
- preserves traceability
- allows reporting and analytics

## End-to-End Flow

```text
User uploads file or searches item
-> backend receives request
-> data is cleaned and normalized
-> embeddings are created
-> similar records are searched
-> rules + confidence score are applied
-> result is shown to user
-> reviewer approves/rejects if needed
-> canonical code is saved
-> audit log is updated
```

## Example Workflow

1. CPSE uploads a list of material names from ERP.
2. Backend removes extra spaces, converts units, and expands abbreviations.
3. AI engine creates embeddings for each item.
4. Similar records are found in the master catalog.
5. The system shows the top 3 matches with reasons.
6. If confidence is high, it recommends reuse of an existing code.
7. If confidence is low, it sends the item to a reviewer.
8. Reviewer approves the best match or creates a new canonical item.
9. The final mapping is stored in the database.

## Matching Logic

The system does not rely on only one method.

It combines:
- semantic similarity
- exact attribute matching
- unit normalization
- synonym expansion
- rule-based filtering
- OCR verification when available

This helps reduce false matches.

## Confidence Scoring

Every match gets a score.

Example scoring idea:
- exact grade match: +30
- same size/unit: +25
- high semantic similarity: +25
- same category/type: +10
- OCR confirmation: +10

Decision rule:
- `80-100` = auto suggest
- `60-79` = show for review
- `<60` = create new candidate or manual check

## Key Features

- duplicate detection
- equivalent material detection
- unit normalization
- synonym handling
- human review workflow
- OCR support
- traceability mapping
- audit logs
- analytics dashboard

## Why This Is Feasible

- fully software-based
- no hardware required
- no paid APIs required for a demo
- can start with CSV files
- can run locally on a laptop
- uses proven technologies

## Suggested Tech Stack

- Frontend: React, Chart.js, Tailwind/Bootstrap
- Backend: Node.js/Express or FastAPI
- AI: Sentence Transformers, FAISS, OCR, OpenCV
- Database: SQLite or PostgreSQL
- File handling: CSV/Excel upload

## Project Structure

```text
project/
├── frontend/
│   ├── pages/
│   ├── components/
│   └── assets/
├── backend/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── utils/
├── ai-engine/
│   ├── embeddings/
│   ├── matching/
│   └── ocr/
├── database/
├── docs/
└── README.md
```

## Benefits

- avoids duplicate material creation
- improves procurement speed
- improves search and reuse
- makes inventory analysis easier
- increases transparency
- improves accountability

## Future Scope

- ERP integration
- multilingual support
- supplier-side validation
- batch and lot tracking
- advanced analytics
- department-wise dashboards

## How to Run the System (Quick Start Guide)

Follow these exact steps to start the complete SIH 2026 prototype on your local machine.

### 1. Setup Backend Environment Variables
First, navigate into the `Backend` directory and ensure your Mistral AI Key is configured.
```bash
cd Backend
```
Create a `.env` file (if it doesn't exist) and add the following:
```env
PORT=5000
JWT_SECRET=supersecret123
MISTRAL_API_KEY=UO7pOvfd0e8pJ7RsHPoRTJvgf2fflluA
ADMIN_PASS=Admin@12345
REVIEWER_PASS=Reviewer@12345
OFFICER_PASS=Officer@12345
```

### 2. Install and Start the Backend API (Port 5000)
Run the following commands inside the `Backend` directory:
```bash
npm install
npm start
```
*The database (`material_intelligence.db`) is automatically built and pre-seeded on first run.*
*Backend endpoints active at `http://localhost:5000`*

### 3. Install and Start the Frontend Portal (Port 3000)
Open a **new terminal window/tab**, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

### 4. (Optional) Generate Test PDFs for OCR
To test the Vision AI and OCR capabilities on the dashboard, you can generate realistic Government Invoices and POs using our PDF script.
Open a **new terminal window/tab**:
```bash
cd pdf_generator
npm install
node generate_pdfs.js
```
*This will create test files like `BHEL_Valves_Receipt.pdf` inside the `pdf_generator` folder, which you can upload in the Dashboard's **OCR Verify** tab.*

### 5. Configured Test Credentials
For local testing, configure these passwords in your `Backend/.env` file:
```env
ADMIN_PASS=YourSecureAdminPass
REVIEWER_PASS=YourSecureReviewerPass
OFFICER_PASS=YourSecureOfficerPass
```
You can then log in using:
- **Ministry Admin**: `admin@cpse.gov.in` *(Access to Raw Data Ingestion)*
- **IOCL Store Officer**: `store.officer@iocl.co.in` *(Access to Raw Data Ingestion)*
- **CPCL Reviewer**: `reviewer@cpcl.co.in` *(Standard QA Access)*

## SIH Metadata

- Problem Statement ID: `SIH26099`
- Title: `AI Driven Standardisation and Harmonization of Material Codes Across CPSEs`
- Theme: `Smart Automation`
- Category: `Software`

## Team Name

SyncMasters

