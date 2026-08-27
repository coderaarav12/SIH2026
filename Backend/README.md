# SyncMasters Backend Prototype

SIH26099 — AI Driven Standardisation and Harmonization of Material Codes Across CPSEs.

## Quick start

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Server:
`http://localhost:5000`

Health:
`GET /api/health`

## Demo account

The server automatically creates:

- email: `reviewer@test.com`
- password: `Test@12345`
- role: `reviewer`

## Main APIs

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Materials
- GET `/api/materials`
- GET `/api/materials/search?q=bolt`
- GET `/api/materials/:id`
- POST `/api/materials`
- PUT `/api/materials/:id`
- DELETE `/api/materials/:id`
- POST `/api/materials/upload`

### AI matching
- POST `/api/matching`
- GET `/api/matching/history`

### Review
- POST `/api/reviews/:candidateId`

### Analytics
- GET `/api/analytics`

## CSV format

Recommended headers:

```csv
material_code,material_name,category,source
MAT-2001,Stainless Steel Hex Bolt M10 x 50 SS304,Fastener,CPSE-ERP
MAT-2002,SS Hex Bolt 10mm x 50mm Grade 304,Fastener,CPSE-ERP
MAT-2003,Carbon Steel Pipe 2 inch SCH40,Pipe,CPSE-ERP
```

The upload endpoint also accepts Excel `.xlsx` and `.xls`.

## Upload with PowerShell

PowerShell's `Invoke-RestMethod` on some Windows versions does not support `-Form`, so use curl.exe:

```powershell
curl.exe -X POST "http://localhost:5000/api/materials/upload" -H "Authorization: Bearer $token" -F "file=@test_materials.csv"
```

## Fast demo

1. Login and save the token.
2. Upload the CSV.
3. Search `bolt`, `pipe`, or `M12`.
4. Send a material description to `/api/matching`.
5. Show top matches, confidence, and explanation.
6. Approve/reject a candidate.
7. Open `/api/analytics`.

This is intentionally a local prototype. The matching engine uses deterministic text similarity, token overlap, abbreviation/synonym expansion, and attribute checks so it works without a paid AI API or internet connection.
