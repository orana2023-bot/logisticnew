import urllib.request
import json

def test_login():
    url = "http://127.0.0.1:5000/api/login"
    payload = {
        "email": "dummy@example.com",
        "password": "password123"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            res_content = response.read().decode('utf-8')
            print(f"Status Code: {status}")
            print(f"Response: {res_content}")
            
            res_json = json.loads(res_content)
            if status == 200 and res_json.get('success'):
                print("Login API verification successful!")
            else:
                print("Login API verification failed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
