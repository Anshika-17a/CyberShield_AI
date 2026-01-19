# src/app.py
import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import our custom modules
from feature_extraction import URLFeatureExtractor
from ocr_engine import OCREngine

app = Flask(__name__)
# Allow all origins for all endpoints
CORS(app, resources={r"/*": {"origins": "*"}})

# --- CONFIGURATION ---
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- LOAD MODELS (THE BRAINS) ---
print("🔌 Loading Intelligence Systems...")

# 1. Load URL Model
try:
    url_model = joblib.load('models/url_model.pkl')
    print("✅ URL Model Loaded")
except:
    print("❌ CRITICAL: URL Model not found. Did you run train_url_model.py?")
    url_model = None

# 2. Load Text Model
try:
    text_model = joblib.load('models/text_model.pkl')
    print("✅ Text Model Loaded")
except:
    print("❌ CRITICAL: Text Model not found. Did you run train_text_model.py?")
    text_model = None

# 3. Initialize OCR (The Eyes)
try:
    print("👁️  Initializing OCR Engine... (This may take a moment)")
    ocr_engine = OCREngine()
    print("✅ OCR Engine Ready")
except Exception as e:
    print(f"⚠️ OCR Failed to load: {e}")
    ocr_engine = None

# --- API ROUTES ---

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "system": "CyberShield AI",
        "endpoints": ["/predict/url", "/predict/text", "/predict/image"]
    })

@app.route('/predict/url', methods=['POST'])
def predict_url():
    if not url_model:
        return jsonify({"error": "URL Model not active"}), 500
        
    data = request.json
    url = data.get('url', '')
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    # --- STEP 1: WHITELIST CHECK ---
    trusted_keywords = [
        # Global Tech
        'google', 'youtube', 'facebook', 'instagram', 'whatsapp', 'twitter', 'x.com', 
        'linkedin', 'github', 'microsoft', 'apple', 'amazon', 'netflix', 'spotify',
        # Indian Streaming & Entertainment
        'hotstar', 'jio', 'jiocinema', 'sonyliv', 'zee5', 'voot', 'altbalaji', 
        'erosnow', 'mxplayer', 'hungama', 'gaana', 'saavn',
        # Indian Payments & Banks
        'paytm', 'phonepe', 'gpay', 'bhim', 'upi', 'razorpay', 'ccavenue', 'billdesk',
        'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara', 'indusind',
        # Shopping & Utils
        'flipkart', 'myntra', 'meesho', 'ajio', 'tata', 'zomato', 'swiggy', 
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

    # --- STEP 2: AI ANALYSIS ---
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
    if not text_model:
        print("❌ Error: Text model is not loaded.")
        return jsonify({"error": "Text Model not active. Check backend logs."}), 500

    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        # Direct Text Prediction
        prediction = text_model.predict([text])[0]
        result = 'SPAM' if prediction == 1 else 'HAM'
        print(f"✅ Text prediction successful: {result}")
        return jsonify({
            'type': 'TEXT_SCAN',
            'snippet': text[:50],
            'result': result,
            # Add a dummy confidence for now, as LinearSVC doesn't provide proba by default
            'confidence': 95.0 
        })
    except Exception as e:
        print(f"❌ Error during text prediction: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/predict/image', methods=['POST'])
def predict_image():
    if not ocr_engine:
        print("❌ Error: OCR engine is not loaded.")
        return jsonify({"error": "OCR Engine not active. Check backend logs."}), 500
    if not text_model:
        print("❌ Error: Text model is not loaded.")
        return jsonify({"error": "Text Model not active for image analysis."}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 1. Save Image Temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"✅ Image saved to: {filepath}")

        # 2. Extract Text (The "Eyes")
        print("👁️ Starting OCR...")
        extracted_text = ocr_engine.extract_text(filepath)
        print(f"✅ OCR complete. Extracted: {extracted_text[:50]}...")
        
        # 3. Analyze Text (The "Brain")
        if len(extracted_text.strip()) == 0:
            result = "UNKNOWN"
            confidence = 0.0
        else:
            prediction = text_model.predict([extracted_text])[0]
            result = 'SPAM' if prediction == 1 else 'HAM'
            confidence = 95.0 # Dummy confidence

        # Cleanup: Delete the image
        os.remove(filepath)
        print("✅ Image cleaned up.")

        return jsonify({
            'type': 'IMAGE_SCAN',
            'extracted_text': extracted_text,
            'result': result,
            'confidence': confidence
        })
    except Exception as e:
        print(f"❌ Error during image processing: {e}")
        # Make sure to clean up the file if it exists
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Image processing failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)