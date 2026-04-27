import requests

def test_kanoon():
    url = "http://localhost:8000/summary/legal"
    payload = {"query": "domestic violence laws in India"}
    response = requests.post(url, json=payload)
    print(response.json())

if __name__ == "__main__":
    test_kanoon()
