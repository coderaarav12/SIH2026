# SyncMasters SIH26099 - Project Architecture

This project utilizes a **Dual-Backend Architecture** to ensure robust cloud authentication and 100% secure, air-gapped AI processing.

## 📂 Directory Structure

### 1. `/frontend` (React + Vite)
- The user interface and dashboard.
- **Port:** 3000 or 5173 (`npm run dev`)
- **Important:** Uses Vite proxy (`vite.config.ts`) to route `/api/*` requests to the Cloudflare Backend. The Voice Assistant UI directly connects to the AI Backend on Port 8000.

### 2. `/Backend` (Cloudflare Worker + D1 Database)
- The primary cloud backend built with Hono.js.
- Handles standard database operations, user authentication (`/api/auth/login`), and JWTs.
- **Port:** 8787 (`npm run dev` or `wrangler dev`)
- **Database:** Cloudflare D1 (Local sqlite DB). Initialized via `npx wrangler d1 execute DB --local --file=./db/schema.sql`.

### 3. `/ai_backend` (Python + FastAPI + Ollama)
- The local, air-gapped Multi-Agent AI Swarm running on the F:\ drive.
- Exposes local endpoints for Voice Chat, PDF OCR (Vision), and Material Normalization.
- **Port:** 8000 (`python server.py`)
- **Models Used:** `sih_custom` (MDM Normalization), `llama3.2-vision` (OCR), `llama3.2` / `llama3.1` (Head AI).

## 🚀 How to run the full stack:
1. Terminal 1: `cd Backend && npm run dev`
2. Terminal 2: `cd frontend && npm run dev`
3. Terminal 3: `cd ai_backend && python server.py`
