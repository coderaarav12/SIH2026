import requests
import sqlite3
import json

class FlawlessSwarm:
    def __init__(self):
        self.db_path = "F:/SIH_AI/inventory.db"
        
        # We define strict JSON schemas for our tools so the AI can never hallucinate
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "standardize_material",
                    "description": "Standardizes a messy industrial material code into a clean JSON structure. Use this whenever the user gives you raw material text.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "raw_text": {"type": "string", "description": "The messy material code to clean"}
                        },
                        "required": ["raw_text"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "query_database",
                    "description": "Executes an SQL query against the CPSE inventory database. The schema is: procurement_records (cpse_name, material_name, category, quantity, unit_price, total_cost, procurement_year).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sql_query": {"type": "string", "description": "The valid SQL query to execute"}
                        },
                        "required": ["sql_query"]
                    }
                }
            }
        ]

    def standardize_material(self, raw_text):
        print(f"\n   [System] Routing to Worker (sih_custom) to clean: '{raw_text}'")
        resp = requests.post("http://localhost:11434/api/generate", json={
            "model": "sih_custom",
            "prompt": raw_text,
            "stream": False
        })
        return resp.json().get("response", "")

    def query_database(self, sql_query):
        print(f"\n   [System] Routing to Worker (Database Analyst) to run: {sql_query}")
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute(sql_query)
            rows = cur.fetchall()
            conn.close()
            return str(rows)
        except Exception as e:
            return f"Database Error: {e}"

    def run(self, user_prompt):
        print(f"\n==================================================")
        print(f"USER REQUEST: {user_prompt}")
        print(f"==================================================")

        messages = [{"role": "user", "content": user_prompt}]

        # Loop to handle multiple tool calls
        for _ in range(5):
            payload = {
                "model": "llama3.2",
                "messages": messages,
                "tools": self.tools,
                "stream": False
            }
            
            response = requests.post("http://localhost:11434/api/chat", json=payload).json()
            message = response.get("message", {})
            
            if not message.get("tool_calls"):
                # If no tools were called, the AI is giving its final answer
                print(f"\n[FINAL AI ANSWER]:\n{message.get('content')}")
                break
                
            # If the AI decided to use a tool, execute it
            messages.append(message)
            
            for tool_call in message.get("tool_calls", []):
                func_name = tool_call["function"]["name"]
                args = tool_call["function"]["arguments"]
                
                print(f"\n[Head AI] Decided to use tool: {func_name}")
                
                if func_name == "standardize_material":
                    result = self.standardize_material(args.get("raw_text"))
                elif func_name == "query_database":
                    result = self.query_database(args.get("sql_query"))
                else:
                    result = "Error: Tool not found."
                    
                print(f"   [Observation]: {result}")
                
                # Pass the tool's result back to the Head AI
                messages.append({
                    "role": "tool",
                    "content": result,
                    "name": func_name
                })

if __name__ == "__main__":
    swarm = FlawlessSwarm()
    swarm.run("We received a messy code: 'VLV GT CS 4IN FLG'. First, standardize this to JSON. Then, using the 'category' from that JSON, query the database to find out which CPSE spent the most total_cost on that specific category in 2025.")
