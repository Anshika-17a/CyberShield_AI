import os
import joblib
import numpy as np
import google.generativeai as genai
import whois  # Requires: pip install python-whois
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from urllib.parse import urlparse
from datetime import datetime

# Import our custom modules
from feature_extraction import URLFeatureExtractor
from ocr_engine import OCREngine

app = Flask(__name__)

# --- 1. CONFIGURATION ---
GEMINI_API_KEY = "AIzaSyD4ddx0sQYyEYP8kdQ1HVwOE8Z55ox7zW0" 
genai.configure(api_key=GEMINI_API_KEY)
# Using the preview model that worked for you
ai_model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')

# System Prompt
SYSTEM_INSTRUCTION = "You are CyberShield AI. Help users with cybersecurity. Keep answers concise."

CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- 2. LOAD MODELS ---
print("🔌 Loading Intelligence Systems...")
try:
    url_model = joblib.load('models/url_model.pkl')
    text_model = joblib.load('models/text_model.pkl')
    print("✅ Models Loaded")
except:
    print("⚠️ Models not found. Using Heuristics only.")
    url_model = None
    text_model = None

try:
    ocr_engine = OCREngine()
except:
    ocr_engine = None

# --- ROUTES ---

@app.route('/')
def home():
    return jsonify({"status": "online", "system": "CyberShield AI"})

@app.route('/predict/url', methods=['POST'])
def predict_url():
    data = request.json
    url = data.get('url', '')
    if not url: return jsonify({'error': 'No URL provided'}), 400

    # --- LAYER 0: LOCALHOST EXCEPTION ---
    try:
        parsed = urlparse(url)
        domain_part = parsed.netloc.split(':')[0].lower()
        if domain_part in ['localhost', '127.0.0.1', '0.0.0.0']:
            return jsonify({'type': 'URL_SCAN', 'input': url, 'result': 'SAFE', 'confidence': 100.0, 'note': 'Local Development Server'})
    except:
        pass

    # --- LAYER 1: SMART DOMAIN WHITELIST ---
    try:
        domain = urlparse(url).netloc.lower()
        if not domain: domain = urlparse("http://" + url).netloc.lower()
    except:
        domain = ""

    trusted_domains = {
        # Developer Tools
        'github.com': 'GitHub', 'gitlab.com': 'GitLab', 'stackoverflow.com': 'StackOverflow',
        'vercel.com': 'Vercel', 'render.com': 'Render',
        
        # Big Tech
        'google.com': 'Google', 'youtube.com': 'YouTube', 'facebook.com': 'Facebook', 
        'instagram.com': 'Instagram', 'linkedin.com': 'LinkedIn', 'twitter.com': 'X (Twitter)',

        # Education & Student Resources 
        'internyet.in': 'VTU Internyet', 
        'vtu.ac.in': 'Visvesvaraya Tech University',
        
        # Indian Shopping 
        'amazon.in': 'Amazon', 'flipkart.com': 'Flipkart', 'myntra.com': 'Myntra',
        'ajio.com': 'Ajio', 'meesho.com': 'Meesho', 'nykaa.com': 'Nykaa', 'tatacliq.com': 'Tata Cliq',
        
        # Finance
        'paytm.com': 'Paytm', 'phonepe.com': 'PhonePe',
        'onlinesbi.sbi': 'SBI Bank', 'hdfcbank.com': 'HDFC', 'icicibank.com': 'ICICI'
    }

    for trusted, name in trusted_domains.items():
        if domain == trusted or domain.endswith("." + trusted):
            return jsonify({'type': 'URL_SCAN', 'input': url, 'result': 'SAFE', 'confidence': 100.0, 'note': f'Official {name} Domain'})

    # --- LAYER 2: SCAM KEYWORD TRAP ---
    scam_keywords = ['win', 'winner', 'lottery', 'prize', 'claim', '1 lakh', 'free', 'offer', 'urgent', 'account blocked', 'kyc', 'update']
    if any(k in url.lower() for k in scam_keywords):
        return jsonify({'type': 'URL_SCAN', 'input': url, 'result': 'PHISHING', 'confidence': 95.0, 'note': 'Detected Scam Keywords'})

    # --- LAYER 3: DOMAIN AGE CHECK ---
    domain_age_note = ""
    is_old_domain = False
    try:
        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date
        if isinstance(creation_date, list): creation_date = creation_date[0]
        
        if creation_date:
            age = (datetime.now() - creation_date).days
            if age > 180: # Older than 6 months
                is_old_domain = True
                domain_age_note = f" (Domain is {age} days old)"
    except:
        pass

    
    if url_model:
        extractor = URLFeatureExtractor(url)
        features = extractor.get_features()
        prediction = url_model.predict([features])[0]
        
        # If AI says Phishing but domain is old -> Trust Age
        if prediction == 1 and is_old_domain:
             return jsonify({'type': 'URL_SCAN', 'input': url, 'result': 'SAFE', 'confidence': 80.0, 'note': 'AI flagged, but Domain Age verified safe.'})

        result = 'PHISHING' if prediction == 1 else 'SAFE'
        confidence = 85.0 if result == 'SAFE' else 95.0 
        
        return jsonify({'type': 'URL_SCAN', 'input': url, 'result': result, 'confidence': confidence, 'note': domain_age_note})
    
    return jsonify({'type': 'URL_SCAN', 'input': url, 'result': 'SAFE', 'confidence': 50.0})

@app.route('/predict/text', methods=['POST'])
def predict_text():
    data = request.json
    text = data.get('text', '').lower()
    
    # Text Scam Trap
    scam_triggers = ['won', 'lottery', 'rupees', 'lakh', 'prize', 'claim', 'click here', 'urgent', 'expired', 'blocked']
    scam_score = 0
    for word in scam_triggers:
        if word in text:
            scam_score += 1
            
    if scam_score >= 1: 
        return jsonify({'type': 'TEXT_SCAN', 'result': 'SPAM', 'confidence': 99.9})

    if text_model:
        prediction = text_model.predict([text])[0]
        result = 'SPAM' if prediction == 1 else 'HAM'
        return jsonify({'type': 'TEXT_SCAN', 'result': result, 'confidence': 95.0})

    return jsonify({'type': 'TEXT_SCAN', 'result': 'HAM', 'confidence': 60.0})

@app.route('/predict/image', methods=['POST'])
def predict_image():
    if 'file' not in request.files: return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        extracted_text = ocr_engine.extract_text(filepath) if ocr_engine else ""
        result = "UNKNOWN"
        if len(extracted_text.strip()) > 0 and text_model:
            prediction = text_model.predict([extracted_text])[0]
            result = 'SPAM' if prediction == 1 else 'HAM'
            
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({'type': 'IMAGE_SCAN', 'extracted_text': extracted_text, 'result': result})
    except Exception as e:
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat_bot():
    data = request.json
    user_message = data.get('message', '')
    if not user_message: return jsonify({'reply': "I didn't catch that."})

    try:
        chat = ai_model.start_chat(history=[{"role": "user", "parts": [SYSTEM_INSTRUCTION]}])
        response = chat.send_message(user_message)
        return jsonify({'reply': response.text})
    except Exception as e:
        print(f"❌ AI Error: {e}") 
        return jsonify({'reply': "My brain is currently offline. Please try again later."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)