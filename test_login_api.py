import requests
import json

def test_login():
    url = "http://127.0.0.1:5000/api/login"
    payload = {
        "email": "dummy@example.com",
        "password": "password123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and response.json().get('success'):
            print("Login API verification successful!")
        else:
            print("Login API verification failed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
