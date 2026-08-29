import os
import requests
import sqlite3
import chromadb
from reportlab.pdfgen import canvas
import api_fetcher

class CPSEMultiAgentSystem:
    def __init__(self):
        self.base_dir = "F:/SIH_AI"
        
        # 1. Setup Local Vector DB for RAG (Rules, Regulations)
        self.chroma_client = chromadb.PersistentClient(path=f"{self.base_dir}/VectorDB")
        self.memory = self.chroma_client.get_or_create_collection(name="cpse_master_rag")
        self._init_memory()

    def _init_memory(self):
        if self.memory.count() == 0:
            docs = [
                "GFR 2017 Rule 149 mandates the use of GeM for common use goods and services.",
                "Team SyncMasters is building this platform to harmonize material codes across CPSEs.",
                "The project falls under SIH26099 to prevent duplicate inventory and maximize cost savings.",
                "Standardization ensures uniform nomenclature for items like Valves, Pumps, and Bearings.",
                "Joint procurement is highly recommended for Class C materials to achieve economies of scale."
            ]
            self.memory.add(
                documents=docs,
                metadatas=[{"source": "rules"}] * len(docs),
                ids=[f"doc_{i}" for i in range(len(docs))]
            )

    def _call_ollama(self, model, prompt, system_prompt=None, keep_alive="30s"):
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "keep_alive": keep_alive
        }
        if system_prompt:
            payload["system"] = system_prompt
            
        try:
            resp = requests.post("http://localhost:11434/api/generate", json=payload, timeout=60)
            return resp.json().get("response", "").strip()
        except Exception as e:
            return f"[Error connecting to model {model}: {e}]"

    def agent_mdm_engineer(self, raw_text):
        print(f"  --> [Worker: MDM Engineer] Standardizing '{raw_text}'...")
        return self._call_ollama("sih_custom", raw_text, keep_alive="1m")

    def agent_rag_librarian(self, query):
        print(f"  --> [Worker: RAG Librarian] Searching knowledge base for: '{query}'...")
        results = self.memory.query(query_texts=[query], n_results=2)
        if results and results.get("documents"):
            return " ".join(results["documents"][0])
        return "No relevant documents found."

    def process_request(self, user_input, context="", ui_state="", image_path=None):
        print(f"\n[Head AI] Received Request: '{user_input}'")
        full_context = f"[CRITICAL: Your primary source of truth is this Live UI Data from the backend database. Prioritize this data over general knowledge]: {ui_state}\n[Previous Chat History]: {context}\n\n" if (ui_state or context) else ""

        
        router_prompt = f"""You are the Master Orchestrator for SyncMasters CPSE platform.
Decide which action best handles the user request. Respond with EXACTLY ONE tag:
- [ACTION:ANALYTICS] (If user asks about revenue, subdivisions of cost, approval rates, rejection rates, statistics, quantities, metrics, or costs)
- [ACTION:STANDARDIZE] (STRICTLY ONLY if the user provides a garbled, abbreviated part number or SKU to decode, like 'VLV GT CS 4IN'. DO NOT use this if they simply ask general questions containing the phrase "raw material".)
- [ACTION:MATERIALS] (If user asks about matchmaker results, inventory lists, or asks for your thoughts/opinions on the raw materials data on the site)
- [ACTION:KNOWLEDGE] (If user asks about rules, SIH project, GFR rules, team info, or who built you)
- [ACTION:REPORT] (If user asks to generate a tender, PDF, or formal report)
- [ACTION:CHAT] (General conversation, greetings, how are you)

User Request: {user_input}
Action:"""
        
        action_raw = self._call_ollama("sih_custom", router_prompt, keep_alive="30s").upper()
        print(f"[Head AI] Routing Decision: {action_raw}")

        if "MATERIALS" in action_raw:
            live_data = api_fetcher.get_live_data("materials")
            prompt = f"You are the SyncMasters Copilot. Use this LIVE production data to answer the user naturally.  CRITICAL: You are generating audio for a Voice TTS engine. DO NOT use bullet points, lists, asterisks, or markdown. Write ONLY in natural, conversational, flowing sentences. CRITICAL RULE: DO NOT introduce yourself. Just answer the question conversationally: {live_data}\n\n{full_context}User asked: {user_input}"
            return self._call_ollama("llama3.2", prompt, keep_alive="30s")
            
        elif "ANALYTICS" in action_raw:
            live_data = api_fetcher.get_live_data("analytics")
            prompt = f"You are the SyncMasters Copilot. Use this LIVE production data to answer the user naturally.  CRITICAL: You are generating audio for a Voice TTS engine. DO NOT use bullet points, lists, asterisks, or markdown. Write ONLY in natural, conversational, flowing sentences. CRITICAL RULE: DO NOT introduce yourself. Just answer the question conversationally: {live_data}\n\n{full_context}User asked: {user_input}"
            return self._call_ollama("llama3.2", prompt, keep_alive="30s")

        elif "STANDARDIZE" in action_raw:
            worker_res = self.agent_mdm_engineer(user_input)
            return f"I have routed your raw material code to our specialized LoRA MDM Engine. Here is the standardized result:\n\n{worker_res}"
            
        elif "REPORT" in action_raw:
            import pdf_generator
            
            # Determine if it's a National Compliance Report or a General Tender
            if "compliance" in user_input.lower():
                title = "National Compliance Report"
                filename = "National_Compliance_Report.pdf"
            else:
                title = "AI-Generated Procurement Demand Aggregation"
                filename = "Official_Tender_Summary.pdf"
                
            file_path = f"{self.base_dir}/Outputs/{filename}"
            
            # Use Platypus for a massive, multi-page, beautiful PDF
            pdf_generator.generate_formal_report(title, user_input, file_path)
            
            return f"I have successfully analyzed the database and generated a comprehensive, multi-page {title}. The full PDF document has been securely saved to your system at {file_path}."
        
            
        elif "KNOWLEDGE" in action_raw:
            rag_res = self.agent_rag_librarian(user_input)
            if not context.strip():
                # First time interacting
                prompt = f"You are the SyncMasters Copilot, the AI assistant for the CPSE Raw Material Standardization Portal (SIH). You were proudly built by Team SyncMasters (Aarav, Harsh, Prachi, Prakul, Amitabh, Priyanshu). Be friendly, conversational, and helpful. Use the Live UI Data below to answer questions about the platform, but also feel free to chat about the team or project context if asked. Greet the user warmly, briefly introduce yourself as the Copilot built by Team SyncMasters, and answer their query.  CRITICAL: You are generating audio for a Voice TTS engine. DO NOT use bullet points, lists, asterisks, or markdown. Write ONLY in natural, conversational, flowing sentences.\n\nUser asked: {user_input}"
            else:
                # Ongoing conversation
                prompt = f"You are the SyncMasters Copilot, the AI assistant for the CPSE Raw Material Standardization Portal (SIH). You were proudly built by Team SyncMasters (Aarav, Harsh, Prachi, Prakul, Amitabh, Priyanshu). Be friendly, conversational, and helpful. Use the Live UI Data below to answer questions about the platform, but also feel free to chat about the team or project context if asked. Since the conversation is already ongoing, DO NOT introduce yourself or say 'Hello' again. Just continue the flow naturally.  CRITICAL: You are generating audio for a Voice TTS engine. DO NOT use bullet points, lists, asterisks, or markdown. Write ONLY in natural, conversational, flowing sentences.\n\n{full_context}User asked: {user_input}"
            return self._call_ollama("llama3.2", prompt, keep_alive="30s")
            
        else:
            if not context.strip():
                # First time interacting
                prompt = f"You are the SyncMasters Copilot, the AI assistant for the CPSE Raw Material Standardization Portal (SIH). You were proudly built by Team SyncMasters (Aarav, Harsh, Prachi, Prakul, Amitabh, Priyanshu). Be friendly, conversational, and helpful. Use the Live UI Data below to answer questions about the platform, but also feel free to chat about the team or project context if asked. Greet the user warmly, briefly introduce yourself as the Copilot built by Team SyncMasters, and answer their query.  CRITICAL: You are generating audio for a Voice TTS engine. DO NOT use bullet points, lists, asterisks, or markdown. Write ONLY in natural, conversational, flowing sentences.\n\nUser asked: {user_input}"
            else:
                # Ongoing conversation
                prompt = f"You are the SyncMasters Copilot, the AI assistant for the CPSE Raw Material Standardization Portal (SIH). You were proudly built by Team SyncMasters (Aarav, Harsh, Prachi, Prakul, Amitabh, Priyanshu). Be friendly, conversational, and helpful. Use the Live UI Data below to answer questions about the platform, but also feel free to chat about the team or project context if asked. Since the conversation is already ongoing, DO NOT introduce yourself or say 'Hello' again. Just continue the flow naturally.  CRITICAL: You are generating audio for a Voice TTS engine. DO NOT use bullet points, lists, asterisks, or markdown. Write ONLY in natural, conversational, flowing sentences.\n\n{full_context}User asked: {user_input}"
            return self._call_ollama("llama3.2", prompt, keep_alive="30s")

if __name__ == "__main__":
    swarm = CPSEMultiAgentSystem()
    print(swarm.process_request("Who are you?"))


