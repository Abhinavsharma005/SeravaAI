import requests
import json

def test_chat():
    url = "http://localhost:8000/chat"
    payload = {
        "text": "I am feeling very stressed today because of work pressure."
    }
    response = requests.post(url, json=payload)
    print(f"Chat Response: {response.json()}")

if __name__ == "__main__":
    test_chat()
