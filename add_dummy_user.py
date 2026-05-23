from werkzeug.security import generate_password_hash
from app import get_db_connection

def add_dummy_user():
    full_name = "Dummy User"
    email = "dummy@example.com"
    phone = "1234567890"
    password = "password123"
    
    hashed_pw = generate_password_hash(password)
    
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                print(f"User with email {email} already exists.")
                return
            
            # Insert dummy user
            cursor.execute(
                "INSERT INTO users (full_name, email, phone, password) VALUES (%s, %s, %s, %s)",
                (full_name, email, phone, hashed_pw)
            )
            conn.commit()
            print(f"Dummy user {email} added successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn.open:
            conn.close()

if __name__ == "__main__":
    add_dummy_user()
