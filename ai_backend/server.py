from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import base64
import os
from reportlab.pdfgen import canvas
from orchestrator import CPSEMultiAgentSystem

app = FastAPI(title="SyncMasters AI Swarm API")

# Allow the React frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Boot up the Swarm Brain
swarm = CPSEMultiAgentSystem()

class ChatRequest(BaseModel):
    message: str
    context: str = ""
    ui_state: str = ""

class StandardizeRequest(BaseModel):
    raw_text: str

@app.get("/")
def health_check():
    return {"status": "SyncMasters AI Swarm is Online (F: Drive Powered)"}

@app.post("/api/voice-chat")
def voice_chat(req: ChatRequest):
    """Takes a transcribed voice message, runs the swarm, and returns the response for the TTS engine to speak."""
    print(f"\n[Voice Input Received]: {req.message}")
    # The swarm handles routing to RAG, SQL, or Chat
    # Pass the context separately so RAG doesn't search for UI JSON
    response = swarm.process_request(req.message, context=req.context, ui_state=req.ui_state)
    return {"reply": response}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def mock_login(req: LoginRequest):
    """Mocks the Node backend login so we can test the UI"""
    print(f"\n[Security] Mock Login Successful for {req.email}")
    return {
        "success": True, 
        "token": "local_dev_token", 
        "user": {"email": req.email, "role": "admin", "name": "SyncMasters Admin"}
    }

@app.post("/api/standardize")
def standardize(req: StandardizeRequest):
    """Direct route to the MDM Custom Engineer model"""
    result = swarm.agent_mdm_engineer(req.raw_text)
    return {"standardized_data": result}

@app.post("/api/vision/ocr")
async def process_invoice(file: UploadFile = File(...)):
    """Vision AI: Extracts text from images/PDFs"""
    print(f"\\n[Vision AI] Processing uploaded document: {file.filename}")
    contents = await file.read()
    encoded_string = base64.b64encode(contents).decode('utf-8')
    
    payload = {
        "model": "llama3.2-vision",
        "prompt": "Extract the raw material descriptions, quantities, and prices from this document.",
        "images": [encoded_string],
        "stream": False
    }
    
    resp = requests.post("http://localhost:11434/api/generate", json=payload)
    extracted_text = resp.json().get("response", "")
    
    # After OCR, automatically pass it to the MDM engine!
    cleaned_json = swarm.agent_mdm_engineer(extracted_text)
    return {"raw_ocr": extracted_text, "cleaned_data": cleaned_json}

@app.post("/api/generate-tender")
def generate_tender(title: str = Form(...), content: str = Form(...)):
    """PDF Generator"""
    pdf_path = swarm.agent_pdf_generator(title, content)
    return {"status": "Success", "download_url": pdf_path}

if __name__ == "__main__":
    import uvicorn
    print("Starting SyncMasters Backend Server on Port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
