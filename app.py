import os
from flask import Flask, request, jsonify, send_from_directory, redirect, session, url_for, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import pymysql
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'transglobal_secure_session_secret_key'
from urllib.parse import urlparse

USE_CLOUD = True


def get_db_connection():
    if USE_CLOUD:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            parsed = urlparse(database_url)
            return pymysql.connect(
                host=parsed.hostname,
                user=parsed.username,
                password=parsed.password,
                database=parsed.path[1:],
                port=parsed.port or 3306,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
        else:
            return pymysql.connect(
                host=os.getenv("CLOUD_DB_HOST"),
                user=os.getenv("CLOUD_DB_USER"),
                password=os.getenv("CLOUD_DB_PASSWORD"),
                database=os.getenv("CLOUD_DB_NAME"),
                port=int(os.getenv("CLOUD_DB_PORT", 3306)),
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
    else:
        return pymysql.connect(
            host=os.getenv("LOCAL_DB_HOST", "127.0.0.1"),
            user=os.getenv("LOCAL_DB_USER", "root"),
            password=os.getenv("LOCAL_DB_PASSWORD", ""),
            database=os.getenv("LOCAL_DB_NAME", "global_logistics"),
            port=int(os.getenv("LOCAL_DB_PORT", 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )

# Automatic database and schema setup on startup
def init_db():
    try:
        if USE_CLOUD:
            database_url = os.getenv("DATABASE_URL")
            if database_url:
                parsed = urlparse(database_url)
                connection = pymysql.connect(
                    host=parsed.hostname,
                    user=parsed.username,
                    password=parsed.password,
                    port=parsed.port or 3306,
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor
                )
                db_name = parsed.path[1:]
            else:
                connection = pymysql.connect(
                    host=os.getenv("CLOUD_DB_HOST"),
                    user=os.getenv("CLOUD_DB_USER"),
                    password=os.getenv("CLOUD_DB_PASSWORD"),
                    port=int(os.getenv("CLOUD_DB_PORT", 3306)),
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor
                )
                db_name = os.getenv("CLOUD_DB_NAME")
        else:
            connection = pymysql.connect(
                host=os.getenv("LOCAL_DB_HOST", "127.0.0.1"),
                user=os.getenv("LOCAL_DB_USER", "root"),
                password=os.getenv("LOCAL_DB_PASSWORD", ""),
                port=int(os.getenv("LOCAL_DB_PORT", 3306)),
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            db_name = os.getenv("LOCAL_DB_NAME", "global_logistics")
            
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
                cursor.execute(f"USE {db_name}")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        full_name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        phone VARCHAR(20) NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS bookings (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        tracking VARCHAR(20) NOT NULL UNIQUE,
                        name VARCHAR(100) NOT NULL,
                        phone VARCHAR(20) NOT NULL,
                        pickup VARCHAR(255) NOT NULL,
                        delivery VARCHAR(255) NOT NULL,
                        parcel TEXT,
                        price DECIMAL(10, 2),
                        status VARCHAR(50) DEFAULT 'Pending',
                        mode VARCHAR(50) DEFAULT 'Ocean',
                        eta VARCHAR(100),
                        progress INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # Create invoices table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS invoices (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        invoice_id VARCHAR(50) UNIQUE NOT NULL,
                        customer_name VARCHAR(255) NOT NULL,
                        client_code VARCHAR(100),
                        booking_id VARCHAR(100),
                        route VARCHAR(255),
                        amount DECIMAL(15, 2) NOT NULL,
                        base_amount DECIMAL(15, 2) NOT NULL,
                        surcharges DECIMAL(15, 2) NOT NULL,
                        tax DECIMAL(15, 2) NOT NULL,
                        due_date DATE,
                        issue_date DATE,
                        status VARCHAR(50) DEFAULT 'PENDING',
                        dispute_reason TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # Create invoice_audit_logs table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS invoice_audit_logs (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        invoice_id VARCHAR(50) NOT NULL,
                        log_time VARCHAR(100),
                        log_text TEXT,
                        log_type VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # Create pending_approvals table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS pending_approvals (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        approval_id VARCHAR(50) UNIQUE NOT NULL,
                        type VARCHAR(100),
                        description TEXT,
                        amount VARCHAR(100),
                        requested_by VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # Seed initial data for Finance (if tables are empty)
                cursor.execute("SELECT COUNT(*) as count FROM invoices")
                if cursor.fetchone()['count'] == 0:
                    print("[INFO] Seeding initial finance data...")
                    invoices_seeds = [
                        ("INV-2026-8911", "Apex Global Logistics Ltd", "APX-702", "BKG-9011", "SHA ➔ ROT", 6450.00, 5200.00, 750.00, 500.00, "2026-06-05", "2026-05-10", "PAID", None),
                        ("INV-2026-8912", "Trans-Pacific Industries", "TRN-104", "BKG-9012", "LAX ➔ SHA", 14850.00, 12500.00, 1350.00, 1000.00, "2026-05-18", "2026-04-18", "OVERDUE", None),
                        ("INV-2026-8913", "Euro-Baltic Import Group", "EUB-308", "BKG-9013", "ROT ➔ LAX", 8900.00, 7200.00, 1100.00, 600.00, "2026-05-28", "2026-04-28", "DISPUTED", "Client claims fuel surcharge mismatch ($350 variance against SLA terms)."),
                        ("INV-2026-8914", "Apex Global Logistics Ltd", "APX-702", "BKG-9014", "SHA ➔ LAX", 22400.00, 18900.00, 2000.00, 1500.00, "2026-04-05", "2026-03-05", "OVERDUE", None),
                        ("INV-2026-8915", "Euro-Baltic Import Group", "EUB-308", "BKG-9015", "ROT ➔ SHA", 11200.00, 9500.00, 1000.00, 700.00, "2026-06-10", "2026-05-10", "PENDING", None)
                    ]
                    for seed in invoices_seeds:
                        cursor.execute("""
                            INSERT INTO invoices (invoice_id, customer_name, client_code, booking_id, route, amount, base_amount, surcharges, tax, due_date, issue_date, status, dispute_reason)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, seed)

                    audit_seeds = [
                        ("INV-2026-8911", "2026-05-10 10:14", "Invoice generated automatically from Booking BKG-9011", "system"),
                        ("INV-2026-8911", "2026-05-12 14:22", "Bank wire matching confirmed. Status set to PAID.", "system"),
                        ("INV-2026-8912", "2026-04-18 09:00", "Invoice generated for Trans-Pacific Industries", "system"),
                        ("INV-2026-8912", "2026-05-19 08:30", "Due date breached. Triggered automated Level 1 warning.", "dunning"),
                        ("INV-2026-8913", "2026-04-28 11:15", "Invoice generated under booking reference BKG-9013", "system"),
                        ("INV-2026-8913", "2026-05-14 15:40", "Client initiated formal billing dispute (Reason: Surcharge Variance)", "dispute"),
                        ("INV-2026-8914", "2026-03-05 16:30", "Invoice generated", "system"),
                        ("INV-2026-8914", "2026-04-06 08:30", "Due date breached. Automated Level 1 reminder dispatched.", "dunning"),
                        ("INV-2026-8914", "2026-04-20 09:15", "Payment outstanding over 15 days. Level 2 Escalation warning dispatched.", "dunning")
                    ]
                    for seed in audit_seeds:
                        cursor.execute("""
                            INSERT INTO invoice_audit_logs (invoice_id, log_time, log_text, log_type)
                            VALUES (%s, %s, %s, %s)
                        """, seed)

                    approval_seeds = [
                        ("APP-901", "Refund Request", "Refund of $1,200.00 for Booking BKG-8801 due to service cancellation", "$1,200.00", "Sanjay Kumar (Customs Coordinator)"),
                        ("APP-902", "Credit Note Issue", "Dispute resolution adjustment of $350.00 for Invoice INV-2026-8913", "$350.00", "Aditya Jaiswal (Billing Lead)"),
                        ("APP-903", "Expense Threshold Override", "Terminal handling surcharge excess waiver override ($850.00)", "$850.00", "Elena Rostova (Operations Manager)")
                    ]
                    for seed in approval_seeds:
                        cursor.execute("""
                            INSERT INTO pending_approvals (approval_id, type, description, amount, requested_by)
                            VALUES (%s, %s, %s, %s, %s)
                        """, seed)

                connection.commit()
            print("[INFO] Database and users table verified/created successfully.")
        finally:
            connection.close()
    except Exception as e:
        print("[WARNING] Database initialization failed: ", e)
        print("[WARNING] Please check that MySQL (XAMPP) is running on localhost:3306.")




# Route to serve the main index.html landing page
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')



# Protected route for Management Tools
@app.route('/Managment_Tools.html/<path:filename>')
def serve_management(filename):
    if 'user' not in session:
        # Redirect to login if user is not authenticated
        response = make_response(redirect('/templates/login.html'))
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response
    response = make_response(send_from_directory('Managment_Tools.html', filename))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    return response

def no_cache_response(response):
    """Add no-cache headers to prevent browser from caching protected pages."""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Route to serve the main Portal page
@app.route('/portal')
def serve_portal():
    if 'user' not in session:
        return redirect('/templates/login.html')
    response = make_response(send_from_directory('templates', 'portal.html'))
    return no_cache_response(response)

# Route to serve login and registration templates (with session auto-redirect if already logged in)
@app.route('/templates/login.html')
def serve_login():
    if 'user' in session:
        return redirect('/portal')
    return send_from_directory('templates', 'login.html')

@app.route('/templates/Login.html')
def serve_login_caps():
    # Handle uppercase URL variation
    return redirect('/templates/login.html')

@app.route('/templates/Register.html')
def serve_register():
    if 'user' in session:
        return redirect('/portal')
    return send_from_directory('templates', 'Register.html')

# --- API ENDPOINTS ---

# Registration API
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No registration data received.'}), 400
        
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    
    if not all([full_name, email, phone, password]):
        return jsonify({'success': False, 'message': 'All form fields are required.'}), 400
        
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # Check if email is already registered
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cursor.fetchone():
                    return jsonify({'success': False, 'message': 'This email address is already registered.'}), 400
                    
                # Hash the password securely and insert the record
                hashed_pw = generate_password_hash(password)
                cursor.execute(
                    "INSERT INTO users (full_name, email, phone, password) VALUES (%s, %s, %s, %s)",
                    (full_name, email, phone, hashed_pw)
                )
            conn.commit()
            return jsonify({'success': True, 'message': 'Account created successfully!'})
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database connection error: {str(e)}'}), 500

# Login API
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No login credentials received.'}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Both email and password are required.'}), 400
        
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()
                
                if not user or not check_password_hash(user['password'], password):
                    return jsonify({'success': False, 'message': 'Invalid email address or password.'}), 401
                    
                # Initialize session state for user
                session['user'] = {
                    'id': user['id'],
                    'full_name': user['full_name'],
                    'email': user['email']
                }
                return jsonify({
                    'success': True,
                    'message': 'Login successful!',
                    'user': {
                        'full_name': user['full_name'],
                        'email': user['email']
                    }
                })
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database connection error: {str(e)}'}), 500

# Logout API
@app.route('/api/logout', methods=['GET', 'POST'])
def api_logout():
    session.clear()
    response = make_response(redirect('/templates/login.html'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    # Clear the session cookie explicitly
    response.delete_cookie(app.config.get('SESSION_COOKIE_NAME', 'session'))
    return response

# Session Status Check API
@app.route('/api/check_session', methods=['GET'])
def api_check_session():
    if 'user' in session:
        return jsonify({'logged_in': True, 'user': session['user']})
    return jsonify({'logged_in': False})

# --- PUBLIC TRACKING API ---
@app.route('/api/track/<tracking_id>', methods=['GET'])
def api_track_shipment(tracking_id):
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM bookings WHERE UPPER(tracking) = %s", (tracking_id.upper(),))
                booking = cursor.fetchone()
                if not booking:
                    return jsonify({'found': False, 'message': 'No shipment found for this tracking ID.'}), 404
                if booking.get('price'):
                    booking['price'] = float(booking['price'])
                return jsonify({'found': True, 'shipment': booking})
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'found': False, 'message': f'Database error: {str(e)}'}), 500

# --- BOOKING API ENDPOINTS ---

# Fetch all bookings
@app.route('/api/bookings', methods=['GET'])
def api_get_bookings():
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM bookings ORDER BY id DESC")
                bookings = cursor.fetchall()
                # Convert decimal to float for JSON serialization
                for b in bookings:
                    if b['price']:
                        b['price'] = float(b['price'])
                return jsonify(bookings)
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching bookings: {str(e)}'}), 500

# Create new booking
@app.route('/api/bookings', methods=['POST'])
def api_create_booking():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No booking data received.'}), 400
        
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                # Insert the record
                cursor.execute(
                    """INSERT INTO bookings (tracking, name, phone, pickup, delivery, parcel, price, status, mode, eta, progress) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        data.get('tracking'),
                        data.get('name'),
                        data.get('phone'),
                        data.get('pickup'),
                        data.get('delivery'),
                        data.get('parcel'),
                        data.get('price'),
                        data.get('status', 'Pending'),
                        data.get('mode', 'Ocean'),
                        data.get('eta'),
                        data.get('progress', 0)
                    )
                )
            conn.commit()
            return jsonify({'success': True, 'message': 'Booking created successfully!'})
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error creating booking: {str(e)}'}), 500

# Update booking
@app.route('/api/bookings/<int:booking_id>', methods=['PUT', 'POST'])
def api_update_booking(booking_id):
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data received.'}), 400
        
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """UPDATE bookings 
                       SET name=%s, phone=%s, pickup=%s, delivery=%s, parcel=%s, price=%s, status=%s, mode=%s, eta=%s, progress=%s 
                       WHERE id=%s""",
                    (
                        data.get('name'),
                        data.get('phone'),
                        data.get('pickup'),
                        data.get('delivery'),
                        data.get('parcel'),
                        data.get('price'),
                        data.get('status'),
                        data.get('mode'),
                        data.get('eta'),
                        data.get('progress'),
                        booking_id
                    )
                )
                if cursor.rowcount == 0:
                    return jsonify({'success': False, 'message': 'Booking not found or no changes made.'}), 404
            conn.commit()
            return jsonify({'success': True, 'message': 'Booking updated successfully!'})
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error updating booking: {str(e)}'}), 500

# Delete specific booking
@app.route('/api/bookings/<int:booking_id>', methods=['DELETE', 'POST'])
def api_delete_booking(booking_id):
    # Support POST for deletion if needed (some clients prefer it)
    if request.method == 'POST' and request.get_json() and request.get_json().get('_method') != 'DELETE':
        return jsonify({'success': False, 'message': 'Invalid deletion request.'}), 400

    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM bookings WHERE id = %s", (booking_id,))
                if cursor.rowcount == 0:
                    return jsonify({'success': False, 'message': 'Booking not found.'}), 404
            conn.commit()
            return jsonify({'success': True, 'message': 'Booking deleted successfully!'})
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error deleting booking: {str(e)}'}), 500

# Clear all bookings
@app.route('/api/bookings/clear', methods=['DELETE', 'POST'])
def api_clear_bookings():
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("TRUNCATE TABLE bookings")
            conn.commit()
            return jsonify({'success': True, 'message': 'All bookings cleared successfully!'})
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error clearing bookings: {str(e)}'}), 500

# --- FINANCE APIs ---

@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed", "success": False}), 500
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM invoices ORDER BY issue_date DESC")
            invoices = cursor.fetchall()
            # Format dates for JSON
            for inv in invoices:
                if inv['due_date']: inv['due_date'] = inv['due_date'].strftime('%Y-%m-%d')
                if inv['issue_date']: inv['issue_date'] = inv['issue_date'].strftime('%Y-%m-%d')
                # Convert decimals to floats/strings for JSON
                inv['amount'] = float(inv['amount'])
                inv['base_amount'] = float(inv['base_amount'])
                inv['surcharges'] = float(inv['surcharges'])
                inv['tax'] = float(inv['tax'])
            return jsonify(invoices), 200
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

@app.route('/api/invoices/<invoice_id>', methods=['GET'])
def get_invoice_details(invoice_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed", "success": False}), 500
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM invoices WHERE invoice_id = %s", (invoice_id,))
            invoice = cursor.fetchone()
            if not invoice:
                return jsonify({"message": "Invoice not found", "success": False}), 404
            
            if invoice['due_date']: invoice['due_date'] = invoice['due_date'].strftime('%Y-%m-%d')
            if invoice['issue_date']: invoice['issue_date'] = invoice['issue_date'].strftime('%Y-%m-%d')
            invoice['amount'] = float(invoice['amount'])
            invoice['base_amount'] = float(invoice['base_amount'])
            invoice['surcharges'] = float(invoice['surcharges'])
            invoice['tax'] = float(invoice['tax'])
            
            cursor.execute("SELECT * FROM invoice_audit_logs WHERE invoice_id = %s ORDER BY created_at ASC", (invoice_id,))
            logs = cursor.fetchall()
            invoice['auditLogs'] = logs
            
            return jsonify(invoice), 200
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    try:
        data = request.get_json()
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed", "success": False}), 500
        
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO invoices (invoice_id, customer_name, client_code, booking_id, route, amount, base_amount, surcharges, tax, due_date, issue_date, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data.get('invoice_id'),
                data.get('customer_name'),
                data.get('client_code'),
                data.get('booking_id'),
                data.get('route'),
                data.get('amount'),
                data.get('base_amount'),
                data.get('surcharges'),
                data.get('tax'),
                data.get('due_date'),
                data.get('issue_date'),
                data.get('status', 'PENDING')
            ))
            
            # Add initial audit log
            cursor.execute("""
                INSERT INTO invoice_audit_logs (invoice_id, log_time, log_text, log_type)
                VALUES (%s, %s, %s, %s)
            """, (
                data.get('invoice_id'),
                data.get('issue_date') + " 12:00",
                "Invoice manually created via financial control desk.",
                "system"
            ))
            
            conn.commit()
            return jsonify({"message": "Invoice created successfully!", "success": True}), 201
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

@app.route('/api/invoices/<invoice_id>/status', methods=['PUT'])
def update_invoice_status(invoice_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed", "success": False}), 500
        
        with conn.cursor() as cursor:
            cursor.execute("UPDATE invoices SET status = %s, dispute_reason = %s WHERE invoice_id = %s", 
                           (data.get('status'), data.get('dispute_reason'), invoice_id))
            
            # Add audit log for status change
            import datetime
            now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
            log_text = f"Status updated to {data.get('status')}."
            if data.get('dispute_reason'):
                log_text += f" Reason: {data.get('dispute_reason')}"
            
            cursor.execute("""
                INSERT INTO invoice_audit_logs (invoice_id, log_time, log_text, log_type)
                VALUES (%s, %s, %s, %s)
            """, (invoice_id, now_str, log_text, "system" if data.get('status') != "DISPUTED" else "dispute"))
            
            conn.commit()
            return jsonify({"message": "Invoice status updated successfully!", "success": True}), 200
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

@app.route('/api/approvals', methods=['GET'])
def get_approvals():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed", "success": False}), 500
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM pending_approvals")
            approvals = cursor.fetchall()
            return jsonify(approvals), 200
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

@app.route('/api/finance/stats', methods=['GET'])
def get_finance_stats():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed", "success": False}), 500
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT status, SUM(amount) as total_amount, COUNT(*) as count FROM invoices GROUP BY status")
            stats = cursor.fetchall()
            # Convert decimal sums to floats
            for s in stats:
                s['total_amount'] = float(s['total_amount']) if s['total_amount'] else 0.0
            return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000,threaded=True)
