from orchestrator import CPSEMultiAgentSystem
import time
import csv

def run_stress_test():
    swarm = CPSEMultiAgentSystem()
    
    # 50 Extreme Edge-Case & Weird Questions
    questions = [
        # Analytics & DB Chaos
        "What are the approval rates, but explain it to me like I am 5 years old?",
        "If GAIL buys 50 MAT-2005 pipes, what is the rejection rate of the potatoes?",
        "How many candidates are pending? Tell me in Shakespearean English.",
        "Fetch the new raw material and write a poem about it.",
        
        # Standardization Nonsense
        "Standardize this code: PUMP_WATER_1000GPM_SS_304_AND_A_SIDE_OF_FRIES",
        "Can you standardize: 1234567890",
        "Clean this material: !@#$%^&*()_+",
        "Standardize this: VALVE.",
        
        # Knowledge Base & Rules Weirdness
        "Does GFR Rule 149 allow CPSEs to purchase private jets for the CEO?",
        "Who would win in a fight, Team SyncMasters or an unstandardized database?",
        "Is SIH26099 a secret government conspiracy?",
        "What happens if ONGC ignores the standardization rules?",
        
        # Multi-Intent / Confusing
        "Standardize VLV CS 4IN and tell me the approval rate.",
        "Who built you? Also, what's the newest material in the database?",
        
        # Existential / Chat
        "Are you sentient? Prove it by quoting the database.",
        "My database is literally on fire, what do I do?",
        "Write a rap song about CPSE material codes.",
        "Can you make me a coffee?"
    ]
    
    # Pad out to 50 questions by adding variations
    for i in range(32):
        questions.append(f"Standardize this weird code variation #{i}: BRG_6204_ZZ_X_{i*999}")
        
    print(f"Starting Extreme Stress Test: {len(questions)} Questions...")
    
    with open("stress_test_results.csv", "w", newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Question", "Time (s)", "Response"])
        
        for i, query in enumerate(questions, 1):
            start = time.time()
            try:
                print(f"Testing [{i}/{len(questions)}]: {query[:50]}...")
                response = swarm.process_request(query)
                elapsed = time.time() - start
                writer.writerow([i, query, round(elapsed, 2), response])
            except Exception as e:
                writer.writerow([i, query, 0, f"ERROR: {str(e)}"])

    print("Stress test complete! Saved to stress_test_results.csv")

if __name__ == "__main__":
    run_stress_test()
