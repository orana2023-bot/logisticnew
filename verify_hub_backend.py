import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000/api/bookings"

def make_request(url, method='GET', data=None):
    if data:
        data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return 500, str(e)

def verify_hub_backend():
    print("--- 1. Creating a detailed booking for Hub Monitoring ---")
    detailed_booking = {
        "tracking": "TRK-HUB-999",
        "name": "Hub Test Client",
        "phone": "5556667777",
        "pickup": "Singapore Terminal",
        "delivery": "Los Angeles Port",
        "parcel": "High-Value Electronic Sensors",
        "price": 125000,
        "status": "In-Transit",
        "mode": "Ocean",
        "eta": "June 15, 2026",
        "progress": 45
    }
    status, result = make_request(BASE_URL, 'POST', detailed_booking)
    print(f"Create Status: {status}, Result: {result}")
    
    print("\n--- 2. Fetching all bookings (Hub's loadShipments logic) ---")
    status, result = make_request(BASE_URL)
    print(f"Fetch Status: {status}")
    
    found = False
    for b in result:
        if b['tracking'] == "TRK-HUB-999":
            found = True
            print(f"Found Hub Test Booking:")
            print(f"  Tracking: {b['tracking']}")
            print(f"  Status: {b['status']}")
            print(f"  ETA: {b['eta']}")
            print(f"  Progress: {b['progress']}")
            break
    
    if found:
        print("\nHub Backend Verification Successful!")
    else:
        print("\nHub Backend Verification Failed: Booking not found.")

if __name__ == "__main__":
    verify_hub_backend()
