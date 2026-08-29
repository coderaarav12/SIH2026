import requests
import json

def get_live_data(query_type):
    print(f"  --> [Worker: API Fetcher] Authenticating with Live Cloudflare Backend (admin@cpse.gov.in)...")
    base_url = "https://sih-backend-worker.ksaup217.workers.dev/api"
    
    login_resp = requests.post(f"{base_url}/auth/login", json={
        "email": "admin@cpse.gov.in",
        "password": os.environ.get("DEFAULT_PASS", "placeholder")
    })
    
    if login_resp.status_code != 200:
        return f"Authentication failed: {login_resp.text}"
        
    token = login_resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    if query_type == "analytics":
        print(f"  --> [Worker: API Fetcher] Fetching comprehensive live metrics, reviews, and approval rates...")
        # Fetch Analytics
        resp_a = requests.get(f"{base_url}/analytics", headers=headers)
        data_a = resp_a.json().get("analytics", {}) if resp_a.status_code == 200 else {}
        
        # Fetch Reviews
        resp_r = requests.get(f"{base_url}/reviews", headers=headers)
        data_r = resp_r.json().get("reviews", []) if resp_r.status_code == 200 else []
        
        # Calculate real approvals/rejections from the reviews table, since the analytics endpoint seems bugged
        real_approved = len([r for r in data_r if r.get('action') == 'approve'])
        real_rejected = len([r for r in data_r if r.get('action') == 'reject'])
        
        # Overwrite the broken analytics fields with the real calculated ones
        data_a['approved'] = real_approved
        data_a['rejected'] = real_rejected
        data_a['total_qa_reviews'] = len(data_r)
        
        return json.dumps(data_a)[:2500]
    
    elif query_type == "materials":
        print(f"  --> [Worker: API Fetcher] Fetching new matchmaker material candidates...")
        resp = requests.get(f"{base_url}/materials", headers=headers)
        if resp.status_code == 200:
            return resp.text[:2500]
        return "Failed to fetch materials."
        
    return "Unknown query type."
