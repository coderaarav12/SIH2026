from orchestrator import CPSEMultiAgentSystem
import time

def run_tests():
    swarm = CPSEMultiAgentSystem()
    
    test_suite = [
        "What are the approval and rejection rates currently in the system?",
        "What's the new raw material that has come up in the AI matchmaker?",
        "Who built you and what is your purpose?",
        "Standardize this code for me: PMP CENT 5HP SS316",
        "Hi, how are you today?"
    ]
    
    print("\n==================================================")
    print("   STARTING RIGOROUS ORCHESTRATOR EVALUATION SUITE")
    print("==================================================\n")
    
    for i, query in enumerate(test_suite, 1):
        print(f"\n[TEST {i}] User Query: '{query}'")
        start_time = time.time()
        
        try:
            response = swarm.process_request(query)
            elapsed = time.time() - start_time
            
            print(f"\n[EVAL RESULT] Time: {elapsed:.2f}s")
            print(f"[AI RESPONSE]:\n{response}\n")
            print("-" * 50)
            
        except Exception as e:
            print(f"\n[EVAL FAILED] Error: {str(e)}\n")
            print("-" * 50)

if __name__ == "__main__":
    run_tests()
