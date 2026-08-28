# SyncMasters - SIH 2026 Material Intelligence Portal

**Problem Statement:** SIH26099 - AI-Driven Standardisation and Harmonization of Material Codes Across CPSEs
**Target Ministry:** Ministry of Petroleum & Natural Gas

## Repository Branches
- \main\ : Development and active codebase.
- \ackend-deploy\ : Cloudflare Workers backend (automatically deployed).
- \rontend-deploy\ : Cloudflare Pages frontend (automatically deployed).

---

## ?? Extensive Feature List (Role-Based)

The platform enforces strict Role-Based Access Control (RBAC) to ensure data integrity and proper procurement workflows across CPSEs.

### ?? 1. Central Ministry Admin
*Role: Executive oversight, configuration, and final authority.*
- **Global Overview Dashboard:** Access to cross-CPSE analytics, total savings (INR), and harmonization rates.
- **Bulk Data Ingestion (Raw Data Tab):** Can upload and map raw legacy ERP data from any CPSE.
- **AI Matcher Execution:** Can trigger the AI semantic engine to deduplicate catalogs.
- **QA Approval Override:** Can approve/reject AI suggestions (overriding standard reviewers if needed).
- **Audit Log Complete Access:** View immutable logs of who changed what, when, and from which CPSE.
- **Tender Generation:** Can generate AI-powered RFP Tender documents for pooled demands.

### ??? 2. CPCL Senior Reviewer (QA)
*Role: Technical verification and quality assurance of AI suggestions.*
- **QA Tab (Quality Assurance):** Dedicated interface to Accept or Reject AI mapping suggestions.
- **Harmonized Master View:** Can view the standardized master catalog and technical specs.
- **RESTRICTED - No Ingestion:** Cannot upload raw data (preventing accidental pollution of the staging area).
- **RESTRICTED - Tender Actions:** Cannot generate or issue RFP tenders (reserved for Admin/Officers).
- **Action Accountability:** All approvals/rejections are stamped with their specific CPCL identity in the Audit Log.

### ?? 3. IOCL Procurement Officer
*Role: Departmental inventory management and demand pooling.*
- **Raw Data Ingestion:** Can upload their specific CPSE's CSV inventory lists.
- **Demand Pooling (Pools Tab):** Can view aggregated multi-CPSE demand to identify bulk purchasing opportunities.
- **Tender Generation:** Can generate the AI Tender (Notice Inviting Tender) for joint procurement.
- **RESTRICTED - QA Approvals:** CANNOT approve AI semantic matches (segregation of duties: buyers cannot alter technical catalog specs).

---

## Core System Features (All Roles)
- **AI Semantic Matching:** Uses embedding models to detect duplicates despite spelling errors, abbreviations, or missing specs (e.g. 'SS Bolt' matches 'Stainless Steel Fastener').
- **OCR Verification:** Upload physical invoices/receipts and extract line items into structured JSON.
- **Cloudflare Edge Architecture:** Fully serverless deployment using Cloudflare Pages, Workers, and D1 (SQLite) with 0ms cold starts.
- **Dynamic Vapour Theming:** The UI supports multiple themes (Default, Warm, Cool, Dark) with premium framer-motion animations.

## How to Test
1. Access the deployed portal at: https://syncmasters.pages.dev
2. Use the security key: \SIH2026-WIN\
3. Login using any of the following pre-configured user accounts:
   - **Admin:** \dmin@cpse.gov.in\ / \changeme123\
   - **Reviewer:** \eviewer@cpcl.co.in\ / \changeme123\
   - **Officer:** \store.officer@iocl.co.in\ / \changeme123\
4. The \	est_data\ folder in the repo contains a sample \ongc_raw_materials.csv\ to test the Bulk Upload feature.
