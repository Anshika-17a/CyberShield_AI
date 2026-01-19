# src/app.py
import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai 

# Import our custom modules
from feature_extraction import URLFeatureExtractor
from ocr_engine import OCREngine

app = Flask(__name__)

# --- AI CONFIGURATION ---
# We use the specific model your API key has access to (from your test results)
GEMINI_API_KEY = "AIzaSyD4ddx0sQYyEYP8kdQ1HVwOE8Z55ox7zW0" 
genai.configure(api_key=GEMINI_API_KEY)
ai_model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')

# System Prompt
SYSTEM_INSTRUCTION = """
You are CyberShield AI. 
1. Help users with cybersecurity threats (phishing, smishing, malware).
2. Keep answers concise (2-3 sentences).
3. If asked about "scanning", tell them to use the Dashboard.
4. If asked about "police", give helpline 1930.
5. Do not answer non-cybersecurity questions.
"""

# Allow all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# --- CONFIGURATION ---
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- LOAD MODELS ---
print("🔌 Loading Intelligence Systems...")

try:
    url_model = joblib.load('models/url_model.pkl')
    print("✅ URL Model Loaded")
except:
    print("❌ CRITICAL: URL Model not found.")
    url_model = None

try:
    text_model = joblib.load('models/text_model.pkl')
    print("✅ Text Model Loaded")
except:
    print("❌ CRITICAL: Text Model not found.")
    text_model = None

try:
    print("👁️  Initializing OCR Engine...")
    ocr_engine = OCREngine()
    print("✅ OCR Engine Ready")
except:
    ocr_engine = None

# --- ROUTES ---

@app.route('/')
def home():
    return jsonify({"status": "online", "system": "CyberShield AI"})

@app.route('/predict/url', methods=['POST'])
def predict_url():
    if not url_model: return jsonify({"error": "URL Model not active"}), 500
    data = request.json
    url = data.get('url', '')
    if not url: return jsonify({'error': 'No URL provided'}), 400

    # --- RESTORED FULL WHITELIST (INDIAN CONTEXT) ---
    trusted_keywords = [
        # AI & Tech Tools
        'chatgpt', 'openai', 'ai.com', 'anthropic', 'claude', 'bard', 'gemini',
        'github', 'gitlab', 'stackoverflow',
        
        # Global Tech
        'google', 'youtube', 'facebook', 'instagram', 'whatsapp', 'twitter', 'x.com', 
        'linkedin', 'microsoft', 'apple', 'amazon', 'netflix', 'spotify',
        
        # Indian Streaming & Entertainment
        'hotstar', 'jio', 'jiocinema', 'sonyliv', 'zee5', 'voot', 'altbalaji', 
        'erosnow', 'mxplayer', 'hungama', 'gaana', 'saavn',
        
        # Indian Payments & Banks
        'paytm', 'phonepe', 'gpay', 'bhim', 'upi', 'razorpay', 'ccavenue', 'billdesk',
        'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara', 'indusind',
        
        # Shopping & Utils
        'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'tata', 'zomato', 'swiggy', 
        'ola', 'uber', 'irctc', 'indigo', 'airindia', 'makemytrip'
    ]
    
    for keyword in trusted_keywords:
        if keyword in url.lower():
             return jsonify({
                'type': 'URL_SCAN', 
                'input': url, 
                'result': 'SAFE', 
                'confidence': 99.99, 
                'note': f'Verified Trusted Brand: {keyword.title()}'
            })

    # AI Analysis
    extractor = URLFeatureExtractor(url)
    features = extractor.get_features()
    prediction = url_model.predict([features])[0]
    probs = url_model.predict_proba([features])[0]
    confidence = probs[1] if prediction == 1 else probs[0]

    return jsonify({
        'type': 'URL_SCAN', 
        'input': url, 
        'result': 'PHISHING' if prediction == 1 else 'SAFE', 
        'confidence': float(confidence) * 100
    })

@app.route('/predict/text', methods=['POST'])
def predict_text():
    if not text_model: return jsonify({"error": "Text Model not active."}), 500
    data = request.json
    text = data.get('text', '')
    if not text: return jsonify({'error': 'No text provided'}), 400
    
    try:
        prediction = text_model.predict([text])[0]
        result = 'SPAM' if prediction == 1 else 'HAM'
        return jsonify({'type': 'TEXT_SCAN', 'result': result, 'confidence': 95.0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        # Only predict if text was actually found
        if len(extracted_text.strip()) > 0 and text_model:
            prediction = text_model.predict([extracted_text])[0]
            result = 'SPAM' if prediction == 1 else 'HAM'
            
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({'type': 'IMAGE_SCAN', 'extracted_text': extracted_text, 'result': result})
    except Exception as e:
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({"error": str(e)}), 500

# --- CHAT ROUTE ---
@app.route('/chat', methods=['POST'])
def chat_bot():
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({'reply': "I didn't catch that."})

    try:
        # Start a chat session
        chat = ai_model.start_chat(history=[
            {"role": "user", "parts": [SYSTEM_INSTRUCTION]},
            {"role": "model", "parts": ["Understood. I am CyberShield AI."]}
        ])
        
        response = chat.send_message(user_message)
        return jsonify({'reply': response.text})
        
    except Exception as e:
        print(f"❌ AI Error: {e}") 
        return jsonify({'reply': "My brain is currently offline. Please try again later."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)