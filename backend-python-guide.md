# Python Backend Implementation Guide

## Setup Instructions

### 1. Create Python Backend Folder
```bash
mkdir backend-python
cd backend-python
```

### 2. Install Required Packages
```bash
pip install flask flask-cors flask-mail python-dotenv sqlite3
```

### 3. Create main.py
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import sqlite3
import random
import string
import hashlib
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # or your email provider
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USERNAME')  # your email
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')  # your app password
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL_USERNAME')

mail = Mail(app)

# Database initialization
def init_db():
    conn = sqlite3.connect('foodgapp.db')
    cursor = conn.cursor()
    
    # Users table (if not exists)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Reset codes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reset_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT FALSE
        )
    ''')
    
    conn.commit()
    conn.close()

def generate_reset_code():
    return ''.join(random.choices(string.digits, k=6))

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        # Check if user exists
        conn = sqlite3.connect('foodgapp.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': 'Email not found'}), 404
        
        # Generate 6-digit code
        code = generate_reset_code()
        expires_at = datetime.now() + timedelta(minutes=15)  # 15 minute expiry
        
        # Store code in database
        cursor.execute('''
            INSERT INTO reset_codes (email, code, expires_at) 
            VALUES (?, ?, ?)
        ''', (email, code, expires_at))
        conn.commit()
        
        # Send email
        msg = Message(
            subject='WellNu Password Reset Code',
            recipients=[email],
            body=f'''
Hello,

Your password reset code is: {code}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
WellNu Team
            '''
        )
        mail.send(msg)
        
        conn.close()
        return jsonify({'success': True, 'message': 'Reset code sent to your email'})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': 'Failed to send reset code'}), 500

@app.route('/verify-reset-code', methods=['POST'])
def verify_reset_code():
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')
        
        if not email or not code:
            return jsonify({'success': False, 'message': 'Email and code are required'}), 400
        
        conn = sqlite3.connect('foodgapp.db')
        cursor = conn.cursor()
        
        # Check if code is valid and not expired
        cursor.execute('''
            SELECT id FROM reset_codes 
            WHERE email = ? AND code = ? AND used = FALSE AND expires_at > ?
        ''', (email, code, datetime.now()))
        
        reset_record = cursor.fetchone()
        
        if not reset_record:
            return jsonify({'success': False, 'message': 'Invalid or expired code'}), 400
        
        # Mark code as used
        cursor.execute('''
            UPDATE reset_codes SET used = TRUE WHERE id = ?
        ''', (reset_record[0],))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Code verified successfully'})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': 'Failed to verify code'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
```

### 4. Create .env file
```
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 5. Run the server
```bash
python main.py
```

## How to Set Up Email:

### For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: Google Account → Security → App passwords
3. Use the app password in EMAIL_PASSWORD

### For Other Providers:
- Update MAIL_SERVER and MAIL_PORT in main.py
- Use appropriate SMTP settings

## File Structure:
```
backend-python/
├── main.py
├── .env
├── foodgapp.db (created automatically)
└── requirements.txt
```

### requirements.txt:
```
flask
flask-cors
flask-mail
python-dotenv
```
