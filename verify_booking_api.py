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
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        return 500, str(e)

def test_booking_crud():
    print("--- 1. Testing Create Booking ---")
    new_booking = {
        "tracking": "TRK_TEST_123",
        "name": "Test Client",
        "phone": "1234567890",
        "pickup": "Test Origin",
        "delivery": "Test Destination",
        "parcel": "Test Parcel Content",
        "price": 50000,
        "status": "Pending",
        "mode": "Road"
    }
    status, result = make_request(BASE_URL, 'POST', new_booking)
    print(f"Status: {status}, Result: {result}")
    
    print("\n--- 2. Testing Get Bookings ---")
    status, result = make_request(BASE_URL)
    print(f"Status: {status}, Count: {len(result)}")
    if len(result) > 0:
        booking_id = result[0]['id']
        print(f"Latest Booking ID: {booking_id}")
        
        print("\n--- 3. Testing Update Booking ---")
        update_data = {
            "name": "Updated Client",
            "phone": "9999999999",
            "pickup": "Updated Origin",
            "delivery": "Updated Destination",
            "parcel": "Updated Parcel Content",
            "price": 60000,
            "status": "Shipped",
            "mode": "Air"
        }
        status, result = make_request(f"{BASE_URL}/{booking_id}", 'PUT', update_data)
        print(f"Status: {status}, Result: {result}")
        
        print("\n--- 4. Testing Delete Booking ---")
        status, result = make_request(f"{BASE_URL}/{booking_id}", 'DELETE')
        print(f"Status: {status}, Result: {result}")
    else:
        print("No bookings found to update/delete.")

    print("\n--- 5. Testing Clear All ---")
    status, result = make_request(f"{BASE_URL}/clear", 'DELETE')
    print(f"Status: {status}, Result: {result}")

if __name__ == "__main__":
    test_booking_crud()
