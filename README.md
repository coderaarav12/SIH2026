# SIH 2026 - Material Intelligence

AI-Driven Standardisation and Harmonization of Material Codes Across CPSEs

## Problem Statement

CPSEs often store the same material under different names, abbreviations, units, and specs. This creates duplicate codes, poor searchability, inconsistent procurement, and weak traceability.

## Proposed Solution

Material Intelligence is a software platform that:
- normalizes material descriptions
- detects duplicates and equivalents
- recommends a single standardized code
- verifies labels using OCR and image evidence
- keeps every approval auditable

## Core Architecture

```text
CPSE Material Masters / CSV / ERP Data / Images
                |
                v
        Ingestion & Normalization
        - unit cleanup
        - abbreviation expansion
        - spec parsing
                |
                v
          AI Matching Layer
        - sentence embeddings
        - vector similarity search
        - rule-based checks
        - OCR / CV label support
                |
                v
         Confidence & Review
        - score match confidence
        - show explanation
        - human approval for uncertain cases
                |
                v
         Standard Material Master
        - single canonical code
        - source mappings
        - traceability history
```

## Architecture Details

### 1. Frontend

Used by procurement, stores, quality, and administrators.

Pages:
- Login and role-based access
- Upload material masters
- Search and compare materials
- Review duplicate suggestions
- Approval queue
- Traceability dashboard

Suggested stack:
- React or plain HTML/CSS/JS
- Chart.js for analytics
- Data tables for comparison views

### 2. Backend

The backend manages business logic and APIs.

Responsibilities:
- authenticate users
- receive material master files
- normalize text and units
- generate embeddings
- run similarity matching
- store reviewer decisions
- expose analytics and audit logs

Suggested stack:
- Python FastAPI for AI services
- Node.js or FastAPI for main API layer

### 3. AI / Matching Engine

This is the core of the solution.

It performs:
- semantic matching of material names
- attribute extraction from descriptions
- detection of equivalent items with different wording
- OCR-based label reading for physical verification
- confidence scoring for every recommendation

Example:
- `Stainless Steel Hex Bolt M10 x 50 SS304`
- `SS Hex Bolt 10mm x 50mm Grade 304`

The engine recognizes these as likely equivalents.

### 4. Database

Stores structured and traceable records.

Main tables:
- `users`
- `materials`
- `material_attributes`
- `match_candidates`
- `review_actions`
- `source_mappings`
- `audit_logs`

Recommended database:
- PostgreSQL for production-style structure
- SQLite for local prototype/demo

### 5. Vector Search / Similarity Search

Used to find likely equivalent materials quickly.

Workflow:
1. Convert material text into embeddings.
2. Compare against existing canonical materials.
3. Rank likely matches.
4. Send uncertain results to human review.

### 6. OCR / Computer Vision Layer

Used only as an evidence layer.

It can:
- read label text from images
- support item verification
- compare uploaded evidence with catalog data

## End-to-End Flow

```text
Upload material list
-> normalize text and units
-> create embeddings
-> search similar records
-> apply rules and confidence scoring
-> show matches to reviewer
-> approve or reject
-> save canonical mapping
-> update standardized master
```

## Key Features

- duplicate detection
- equivalent material identification
- unit normalization
- human-in-the-loop approval
- OCR label verification
- traceability of source codes
- audit trail for every decision

## Feasibility

- software-first approach
- no hardware dependency
- can start from CSV or ERP exports
- uses proven technologies: NLP, OCR, vector search, SQL
- scalable from one CPSE to many CPSEs

## Suggested Tech Stack

- Frontend: React, Chart.js
- Backend: FastAPI or Node.js
- AI: Sentence Transformers, OCR, OpenCV
- DB: PostgreSQL or SQLite
- Search: FAISS / pgvector

## Project Structure

```text
project/
├── frontend/
├── backend/
├── ai-engine/
├── database/
├── docs/
└── README.md
```

## Why This Matters

- reduces duplicate material creation
- improves procurement efficiency
- improves search and reuse
- supports inventory analysis
- increases transparency and auditability

## Future Scope

- ERP integration
- multilingual material normalization
- supplier-side validation
- batch and lot traceability
- analytics dashboard for procurement trends

## SIH Metadata

- Problem Statement ID: SIH26099
- Title: AI Driven Standardisation and Harmonization of Material Codes Across CPSEs
- Theme: Smart Automation
- Category: Software

## Team Name

SyncMasters
