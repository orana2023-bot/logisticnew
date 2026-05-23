import pymysql

def migrate_db():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            database='global_logistics',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        try:
            with connection.cursor() as cursor:
                # Check if columns exist
                cursor.execute("DESCRIBE bookings")
                columns = [col['Field'] for col in cursor.fetchall()]
                
                if 'eta' not in columns:
                    print("Adding 'eta' column...")
                    cursor.execute("ALTER TABLE bookings ADD COLUMN eta VARCHAR(100)")
                
                if 'progress' not in columns:
                    print("Adding 'progress' column...")
                    cursor.execute("ALTER TABLE bookings ADD COLUMN progress INT DEFAULT 0")
                
                connection.commit()
                print("Migration completed successfully.")
        finally:
            connection.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_db()
