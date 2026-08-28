import requests
import sqlite3
import re
import time

class AutonomousSwarm:
    def __init__(self):
        self.db_path = "F:/SIH_AI/inventory.db"
        self.manager_model = "llama3.2"
        self.worker_model = "sih_custom"
        
        self.system_prompt = """You are the Autonomous Master Orchestrator for the SyncMasters CPSE platform.
Your goal is to answer the user's request by utilizing your available tools.

You have access to the following tools:
- Standardize: Converts messy raw material text into standardized JSON. Input should be the raw string.
- QueryDB: Executes a raw SQL query against the inventory database to answer questions about CPSE purchases. The schema is: procurement_records (cpse_name, material_name, category, quantity, unit_price, total_cost, procurement_year). Input must be a valid SQL query.

You MUST use the following exact format for your responses:
Question: the input question you must answer
Thought: explain your reasoning and what tool you need to use next
Action: the name of the tool to use (must be either Standardize or QueryDB)
Action Input: the exact input string to send to the tool

Once you have gathered all the information needed to answer the user's request, use this format:
Thought: I now have all the information needed to answer the user.
Final Answer: the final response to the user.

Remember: You can use multiple tools in sequence. Always wait for the Observation after an Action."""

    def _call_ollama(self, model, prompt, stop_sequences=None):
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1}
        }
        if stop_sequences:
            payload["options"]["stop"] = stop_sequences
            
        try:
            resp = requests.post("http://localhost:11434/api/generate", json=payload)
            return resp.json().get("response", "").strip()
        except Exception as e:
            return f"Error: {e}"

    def tool_standardize(self, raw_text):
        print(f"\n   [System] ->  Routing to Worker (sih_custom) for Standardization...")
        # We tell the specialized worker to just do its job
        result = self._call_ollama(self.worker_model, raw_text)
        return result

    def tool_querydb(self, sql_query):
        print(f"\n   [System] ->  Executing SQL Database Query...")
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute(sql_query)
            rows = cur.fetchall()
            conn.close()
            if not rows:
                return "Query executed successfully, but returned 0 results."
            return str(rows)
        except Exception as e:
            return f"Database Error: {e}"

    def run(self, user_question, max_loops=5):
        print(f"\n==================================================")
        print(f"USER REQUEST: {user_question}")
        print(f"==================================================")
        
        prompt = self.system_prompt + f"\n\nQuestion: {user_question}\n"
        
        for i in range(max_loops):
            # The Manager thinks and decides an action
            response = self._call_ollama(self.manager_model, prompt, stop_sequences=["Observation:"])
            print(f"\n{response}")
            
            prompt += f"{response}\n"
            
            # Check if it reached a final answer
            if "Final Answer:" in response:
                print("\n[System] ✅ Task Complete.")
                return
                
            # Parse the Action and Action Input using regex
            action_match = re.search(r"Action:\s*(.*)", response)
            input_match = re.search(r"Action Input:\s*(.*)", response)
            
            if action_match and input_match:
                action = action_match.group(1).strip()
                action_input = input_match.group(1).strip()
                
                observation = ""
                if "Standardize" in action:
                    observation = self.tool_standardize(action_input)
                elif "QueryDB" in action:
                    observation = self.tool_querydb(action_input)
                else:
                    observation = f"Error: Tool '{action}' is not valid."
                
                print(f"Observation: {observation}")
                prompt += f"Observation: {observation}\n"
            else:
                # If it messed up the format, nudge it back
                prompt += "Observation: Format error. You must provide an 'Action' and 'Action Input'.\n"
        
        print("\n[System] ❌ Reached max loops without a final answer.")

if __name__ == "__main__":
    agent = AutonomousSwarm()
    
    # Complex, multi-intent prompt
    test_query = "We received a messy code: 'VLV GT CS 4IN FLG'. First, standardize this to JSON. Then, using the 'category' from that JSON, query the database to find out which CPSE spent the most total_cost on that specific category in 2025."
    
    agent.run(test_query)
