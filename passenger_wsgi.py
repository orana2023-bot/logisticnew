import sys
import os

# Add the project directory to the sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app instance (renamed to application as required by cPanel Passenger)
from app import app as application
