import requests
import json
import base64
import chromadb
from reportlab.pdfgen import canvas
import os

class SIHOmniAgent:
    def __init__(self):
        print("[System] Booting up Omni-Agent...")
        # Initialize Vector Memory (ChromaDB) on the F: drive!
        os.makedirs("F:/SIH_AI/VectorDB", exist_ok=True)
        self.chroma_client = chromadb.PersistentClient(path="F:/SIH_AI/VectorDB")
        self.memory = self.chroma_client.get_or_create_collection(name="sih_knowledge")
        
        self._inject_team_knowledge()

    def _inject_team_knowledge(self):
        """Injects core identity and team information into the AI's long-term memory."""
        knowledge_base = [
            "We are Team SyncMasters.",
            "We are participating in Smart India Hackathon (SIH) 2026.",
            "Our problem statement is SIH26099: AI Driven Standardisation and Harmonization of Material Codes Across CPSEs.",
            "Our mentor and evaluator is Dr. Maragatham G.",
            "Our web application architecture uses a React frontend, Cloudflare Workers backend, and a 100% local, air-gapped AI processing engine running on the F: drive to ensure absolute data sovereignty and privacy for Indian Government data.",
            "Our custom AI was fine-tuned using LoRA to expertly understand mechanical and electrical engineering abbreviations."
        ]
        
        # Load it into ChromaDB
        self.memory.add(
            documents=knowledge_base,
            ids=[f"info_{i}" for i in range(len(knowledge_base))]
        )
        print("[System] Team SyncMasters identity successfully injected into Long-Term Memory.")

    def ask_memory(self, question):
        """RAG System: Searches Vector DB and answers based on our team's knowledge"""
        results = self.memory.query(query_texts=[question], n_results=3)
        context = " ".join(results['documents'][0])
        
        # Use our custom model to formulate the answer based on context
        prompt = f"Context: {context}\n\nQuestion: {question}\nAnswer confidently based on the context:"
        return self._call_ollama("sih_custom", prompt)

    def read_invoice_image(self, image_path):
        """Vision AI: Extracts text from images using Llama-3.2-Vision"""
        print(f"[Vision] Reading {image_path}...")
        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
            payload = {
                "model": "llama3.2-vision",
                "prompt": "Extract all the material items, quantities, and raw descriptions from this invoice.",
                "images": [encoded_string],
                "stream": False
            }
            response = requests.post("http://localhost:11434/api/generate", json=payload)
            return response.json()['response']
        except Exception as e:
            return f"Error reading image: {e}"

    def standardize_material(self, raw_text):
        """MDM AI: Cleans messy text into JSON using our custom LoRA model"""
        print(f"[MDM] Standardizing: {raw_text}")
        return self._call_ollama("sih_custom", raw_text)

    def generate_pdf_report(self, title, content, output_filename="output.pdf"):
        """Hands: Generates a professional PDF document"""
        c = canvas.Canvas(output_filename)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, 800, title)
        c.setFont("Helvetica", 12)
        
        y_position = 760
        for line in content.split('\n'):
            c.drawString(50, y_position, line[:100]) # Simple line wrap
            y_position -= 20
            if y_position < 50: # New page if full
                c.showPage()
                c.setFont("Helvetica", 12)
                y_position = 800
                
        c.save()
        print(f"[PDF] Document saved as {output_filename}")

    def _call_ollama(self, model, prompt):
        payload = {"model": model, "prompt": prompt, "stream": False}
        try:
            response = requests.post("http://localhost:11434/api/generate", json=payload)
            return response.json().get('response', 'Error: No response')
        except requests.exceptions.ConnectionError:
            return "Error: Could not connect to Ollama. Make sure the Ollama app is running!"

# --- DEMO ---
if __name__ == "__main__":
    agent = SIHOmniAgent()
    
    print("\n--------------------------------------------------")
    print("TEST 1: TEAM IDENTITY & MEMORY (RAG)")
    print("--------------------------------------------------")
    question = "Who are we, what is our problem statement, and why is our AI architecture secure?"
    print(f"Asking AI: {question}")
    answer = agent.ask_memory(question)
    print(f"\nAI Response:\n{answer}\n")
    
    print("--------------------------------------------------")
    print("TEST 2: CORE TASK (JSON NORMALIZATION)")
    print("--------------------------------------------------")
    messy_code = "VLV GT CS 4IN FLG"
    clean_json = agent.standardize_material(messy_code)
    print(f"\nCleaned JSON Output:\n{clean_json}\n")
    
    print("--------------------------------------------------")
    print("TEST 3: PDF TENDER GENERATION")
    print("--------------------------------------------------")
    pdf_content = f"SYNCMASTERS AUTOMATED REPORT\n\nOriginal Input: {messy_code}\n\nStandardized Output:\n{clean_json}\n\nGenerated autonomously by SIH26099 Omni-Agent."
    agent.generate_pdf_report("SIH26099 Automated Material Report", pdf_content, "SyncMasters_Report.pdf")
    print("Success! Check your folder for 'SyncMasters_Report.pdf'.")

