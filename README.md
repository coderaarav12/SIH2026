# SyncMasters - SIH 2026 Material Intelligence Portal

**Problem Statement:** SIH26099 - AI-Driven Standardisation and Harmonization of Material Codes Across CPSEs
**Target Ministry:** Ministry of Petroleum & Natural Gas

## Repository Branches
- main : Development and active codebase.
- ackend-deploy : Cloudflare Workers backend (automatically deployed).
- rontend-deploy : Cloudflare Pages frontend (automatically deployed).

## How to Test
1. Access the deployed portal at: https://syncmasters.pages.dev
2. Use the security key: SIH2026-WIN
3. Login using any of the following pre-configured user accounts:
   - **Admin:** dmin@cpse.gov.in / changeme123
   - **Reviewer:** eviewer@cpcl.co.in / changeme123
   - **Officer:** store.officer@iocl.co.in / changeme123
4. The 	est_data folder in the repo contains a sample ongc_raw_materials.csv to test the Bulk Upload feature.
5. For the AI Matcher OCR, you can provide any text to test material specification extraction.

