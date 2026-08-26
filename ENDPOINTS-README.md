# SIH 2026 - Frontend vs Backend Split

This file separates work clearly.

## 1. Frontend Calls

These are the API calls the frontend team will use in the UI.

| Page | UI Purpose | Frontend Calls |
|---|---|---|
| Home | Landing page | `GET /api/analytics/overview` |
| Login | User login | `POST /api/auth/login` |
| Register | New user signup | `POST /api/auth/register` |
| Dashboard | Stats and charts | `GET /api/analytics/overview`, `GET /api/analytics/trends`, `GET /api/analytics/duplicates` |
| Upload Page | Upload CSV/Excel file | `POST /api/materials/upload` |
| Search Page | Search materials | `GET /api/materials/search?q=` |
| Material Detail Page | View one item | `GET /api/materials/:id` |
| Review Page | Review AI suggestions | `GET /api/matches/pending`, `GET /api/matches/:id`, `POST /api/matches/:id/approve`, `POST /api/matches/:id/reject`, `POST /api/matches/:id/escalate` |
| Audit Page | View action history | `GET /api/audit/logs` |
| Admin Page | Manage users/roles | `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id/role`, `DELETE /api/users/:id` |

### Frontend Task Split

Frontend team builds:
- pages
- forms
- tables
- charts
- review queue UI
- API integration layer
- validation and error messages

### Frontend Components

| Component | What it does |
|---|---|
| `Navbar` | Navigation |
| `LoginForm` | Login input and submit |
| `RegisterForm` | Signup input and submit |
| `UploadPanel` | File upload UI |
| `SearchBar` | Search input |
| `MaterialTable` | Display materials |
| `CompareView` | Compare similar items |
| `SuggestionCard` | Show AI matches |
| `ReviewQueue` | Pending approvals |
| `StatsCards` | Summary boxes |
| `Charts` | Analytics charts |
| `AuditTable` | History table |

### Frontend File Split

| File | Responsibility |
|---|---|
| `src/pages/Home.jsx` | Home page |
| `src/pages/Login.jsx` | Login page |
| `src/pages/Register.jsx` | Register page |
| `src/pages/Dashboard.jsx` | Dashboard |
| `src/pages/Upload.jsx` | Upload page |
| `src/pages/Search.jsx` | Search page |
| `src/pages/Review.jsx` | Review page |
| `src/pages/Audit.jsx` | Audit history |
| `src/services/api.js` | All API calls from frontend |

---

## 2. Backend Endpoints

These are the routes the backend team will implement.

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check if server is alive |

### Authentication

| Method | Endpoint | Request Body |
|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password, role }` |
| `POST` | `/api/auth/login` | `{ email, password }` |
| `GET` | `/api/auth/me` | JWT in header |

### Users

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/:id` | Get one user |
| `PUT` | `/api/users/:id/role` | Change role |
| `DELETE` | `/api/users/:id` | Delete user |

### Materials

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/materials` | List all materials |
| `POST` | `/api/materials` | Create new canonical material |
| `GET` | `/api/materials/:id` | Get one material |
| `PUT` | `/api/materials/:id` | Update material |
| `DELETE` | `/api/materials/:id` | Delete material |
| `GET` | `/api/materials/search?q=` | Search similar items |

### Upload

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/materials/upload` | Upload CSV/Excel data |
| `POST` | `/api/materials/upload/images` | Upload label images |

### Matching

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/matches/run` | Run AI matching |
| `GET` | `/api/matches/pending` | Get review queue |
| `GET` | `/api/matches/:id` | Get one suggestion |
| `POST` | `/api/matches/:id/approve` | Approve match |
| `POST` | `/api/matches/:id/reject` | Reject match |
| `POST` | `/api/matches/:id/escalate` | Send to manual review |

### Normalization

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/normalize/text` | Clean and standardize text |
| `POST` | `/api/normalize/unit` | Normalize units |
| `POST` | `/api/normalize/batch` | Normalize many records |

### OCR

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/ocr/extract` | Read text from image |
| `POST` | `/api/ocr/verify` | Verify OCR result |

### Analytics

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/analytics/overview` | Summary metrics |
| `GET` | `/api/analytics/trends` | Time-series data |
| `GET` | `/api/analytics/duplicates` | Duplicate rate |
| `GET` | `/api/analytics/review-time` | Average review time |
| `GET` | `/api/analytics/source-breakdown` | Source-wise analysis |

### Audit

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/audit/logs` | List audit logs |
| `GET` | `/api/audit/logs/:id` | Single audit log |
| `POST` | `/api/audit/logs` | Create log entry |

---

## 3. Backend Task Split

Backend team builds:
- authentication
- user management
- material CRUD
- file upload
- normalization
- matching engine APIs
- OCR APIs
- analytics APIs
- audit logging

### Backend File Split

| File | Responsibility |
|---|---|
| `server.js` | App entry point |
| `routes/auth.js` | Auth routes |
| `routes/users.js` | User routes |
| `routes/materials.js` | Material routes |
| `routes/upload.js` | Upload routes |
| `routes/matches.js` | Matching routes |
| `routes/normalize.js` | Normalization routes |
| `routes/ocr.js` | OCR routes |
| `routes/analytics.js` | Analytics routes |
| `routes/audit.js` | Audit routes |
| `services/matching.js` | Matching logic |
| `services/normalization.js` | Normalization logic |
| `services/ocr.js` | OCR logic |
| `services/analytics.js` | Metrics logic |
| `db/init.js` | Create database tables |

---

## 4. Quick Work Division

### Frontend Team

Build UI and API calls for:
- login/register
- dashboard
- upload
- search
- review
- audit
- admin

### Backend Team

Build routes and logic for:
- auth
- users
- materials
- upload
- matching
- normalization
- OCR
- analytics
- audit

---

## 5. Simple Rule

- Frontend team only worries about what the user sees and which API it calls.
- Backend team only worries about building the API and database logic.
