# SIH 2026 - Frontend and Backend Endpoint Guide

This file is meant to split the work clearly between frontend and backend.

## 1. Frontend Work Breakdown

### Main Pages

| Page | Route | Purpose | Main API Used |
|---|---|---|---|
| Home | `/` | Landing page, project intro, quick links | `GET /api/analytics/overview` |
| Login | `/login` | User login | `POST /api/auth/login` |
| Register | `/register` | New user signup | `POST /api/auth/register` |
| Dashboard | `/dashboard` | Stats, charts, summary cards | `GET /api/analytics/overview`, `GET /api/analytics/trends` |
| Upload Data | `/upload` | Upload CSV/Excel material masters | `POST /api/materials/upload` |
| Search Materials | `/search` | Search and compare materials | `GET /api/materials/search` |
| Match Review | `/review` | Review AI duplicate/equivalent suggestions | `GET /api/matches/pending`, `POST /api/matches/:id/approve`, `POST /api/matches/:id/reject` |
| Material Details | `/materials/:id` | View one canonical material | `GET /api/materials/:id` |
| Audit Logs | `/audit` | See approvals and history | `GET /api/audit/logs` |
| Admin Panel | `/admin` | Manage users and system config | `GET /api/users`, `PUT /api/users/:id/role` |

### Frontend Components

| Component | Responsibility |
|---|---|
| `Navbar` | Navigation between pages |
| `LoginForm` | Login form and validation |
| `RegisterForm` | Signup form and validation |
| `UploadPanel` | Upload CSV/Excel file |
| `SearchBar` | Search materials by name/spec |
| `MaterialTable` | Show material records in table form |
| `CompareCard` | Compare two or more similar materials |
| `SuggestionList` | Show AI match suggestions |
| `ReviewQueue` | Show pending items for approval |
| `StatsCards` | Show total materials, matches, approvals |
| `Charts` | Trend charts and analytics |
| `AuditTable` | Show approval history |

### Frontend API Calls

| Method | Endpoint | What Frontend Sends |
|---|---|---|
| `POST` | `/api/auth/register` | name, email, password, role |
| `POST` | `/api/auth/login` | email, password |
| `GET` | `/api/materials` | optional search/filter params |
| `POST` | `/api/materials/upload` | file, uploadedBy |
| `GET` | `/api/materials/search?q=` | search text |
| `GET` | `/api/materials/:id` | material id |
| `GET` | `/api/matches/pending` | reviewer queue items |
| `POST` | `/api/matches/:id/approve` | reviewer decision note |
| `POST` | `/api/matches/:id/reject` | reviewer decision note |
| `GET` | `/api/analytics/overview` | dashboard summary |
| `GET` | `/api/analytics/trends` | chart data |
| `GET` | `/api/audit/logs` | filters for date/user/action |

---

## 2. Backend Work Breakdown

### Backend Modules

| Module | Responsibility |
|---|---|
| `auth` | Register, login, JWT handling |
| `users` | User listing, role changes |
| `materials` | Create, update, search, fetch materials |
| `upload` | File upload and parsing |
| `normalization` | Clean names, units, abbreviations |
| `matching` | Find duplicates and equivalents |
| `ocr` | Read text from label images |
| `analytics` | Dashboard summaries and charts |
| `audit` | Store and retrieve history |
| `review` | Approve/reject AI suggestions |

### Backend Endpoints

#### Health

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check if backend is running |

#### Authentication

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password, role }` | user created + token |
| `POST` | `/api/auth/login` | `{ email, password }` | token + user info |
| `GET` | `/api/auth/me` | token in header | current user details |

#### Users

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get one user |
| `PUT` | `/api/users/:id/role` | Change user role |
| `DELETE` | `/api/users/:id` | Remove user |

#### Materials

| Method | Endpoint | Request Body / Query | Purpose |
|---|---|---|---|
| `GET` | `/api/materials` | filters, page, limit | List all materials |
| `POST` | `/api/materials` | canonical material data | Create new material |
| `GET` | `/api/materials/:id` | material id | Get one material |
| `PUT` | `/api/materials/:id` | updated material data | Update material |
| `DELETE` | `/api/materials/:id` | material id | Delete material |
| `GET` | `/api/materials/search?q=` | search text | Search similar materials |

#### Upload

| Method | Endpoint | Request Body | Purpose |
|---|---|---|---|
| `POST` | `/api/materials/upload` | file + metadata | Upload CSV/Excel file |
| `POST` | `/api/materials/upload/images` | label image files | Upload images for OCR |

#### Matching

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/matches/run` | Run AI matching on uploaded rows |
| `GET` | `/api/matches/pending` | Show items waiting for review |
| `GET` | `/api/matches/:id` | Get one match suggestion |
| `POST` | `/api/matches/:id/approve` | Approve suggested match |
| `POST` | `/api/matches/:id/reject` | Reject suggested match |
| `POST` | `/api/matches/:id/escalate` | Send to manual review |

#### Normalization

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/normalize/text` | Normalize material text |
| `POST` | `/api/normalize/unit` | Convert and standardize units |
| `POST` | `/api/normalize/batch` | Normalize many records together |

#### OCR

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/ocr/extract` | Read text from one image |
| `POST` | `/api/ocr/verify` | Verify OCR text against master data |

#### Analytics

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/analytics/overview` | Total materials, matches, approvals |
| `GET` | `/api/analytics/trends` | Time-based trend data |
| `GET` | `/api/analytics/duplicates` | Duplicate rate stats |
| `GET` | `/api/analytics/review-time` | Average review time |
| `GET` | `/api/analytics/source-breakdown` | Source-wise material stats |

#### Audit

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/audit/logs` | View all audit logs |
| `GET` | `/api/audit/logs/:id` | View one audit entry |
| `POST` | `/api/audit/logs` | Store a new audit event |

---

## 3. Suggested Request Formats

### Register

```json
{
  "name": "Aarav",
  "email": "aarav@example.com",
  "password": "123456",
  "role": "reviewer"
}
```

### Login

```json
{
  "email": "aarav@example.com",
  "password": "123456"
}
```

### Create Material

```json
{
  "code": "MAT-001",
  "name": "Stainless Steel Hex Bolt M10 x 50",
  "category": "Fastener",
  "grade": "304",
  "size": "10x50 mm",
  "unit": "Piece"
}
```

### Approve Match

```json
{
  "reviewerNote": "Same size, same grade, equivalent item"
}
```

---

## 4. Work Split for Team Members

### Frontend Team

Build:
- login/register pages
- dashboard
- upload page
- search and compare page
- review queue page
- audit page

### Backend Team

Build:
- auth APIs
- material CRUD APIs
- upload parsing
- normalization logic
- matching engine APIs
- analytics APIs
- audit logging

### AI / Logic Team

Build:
- embeddings
- similarity search
- confidence scoring
- OCR verification
- explanation generation

### Database Team

Build:
- schema design
- migrations
- indexing
- audit storage

---

## 5. Recommended Priority Order

1. Authentication
2. Material CRUD
3. Upload and parsing
4. Normalization
5. Matching and review queue
6. Dashboard analytics
7. OCR support
8. Audit logs

---

## 6. Short Summary

If you want to divide work fast:
- Frontend handles screens and API calls.
- Backend handles logic and database.
- AI module handles matching and scoring.
- Database stores materials, users, decisions, and logs.
