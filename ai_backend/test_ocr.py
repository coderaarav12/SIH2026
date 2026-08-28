import requests

url = "http://localhost:8000/api/vision/ocr"
file_path = r"C:\Users\aarav\.gemini\antigravity\brain\21fccba7-46c2-4b23-bc72-0c84e1283382\.user_uploaded\media_1787937829523.png"

print(f"Uploading {file_path} to AI Vision Engine...")
with open(file_path, "rb") as f:
    files = {"file": ("screenshot.png", f, "image/png")}
    response = requests.post(url, files=files)

print("VISION OCR RESULT:")
print(response.text)
