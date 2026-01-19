# src/train_text_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# 1. Load Data
print("Loading Text Data...")
try:
    df = pd.read_csv('dataset/spam.csv', encoding='latin-1')
except:
    df = pd.read_csv('dataset/spam.csv', encoding='utf-8')

df = df.rename(columns={'v1': 'label', 'v2': 'message'})
df['is_spam'] = df['label'].apply(lambda x: 1 if x == 'spam' else 0)

# 2. DATA AUGMENTATION (Context-Aware)

# --- THREATS (Link + Urgency) ---
threats = [
    # Smishing / Delivery
    "Urgent: Your package delivery has been attempted. http://bit.ly/secure",
    "Final Reminder: Update address immediately to avoid return.",
    "Netflix: Payment failed. Update details to avoid suspension.",
    # Banking Scams
    "SBI: Your KYC is expired. Click link to reactivate.",
    "HDFC: Account blocked due to suspicious activity. Verify now.",
    "ICICI: Points expiring. Redeem cash now http://tinyurl.com/pts",
    "Pan card update mandatory otherwise account freeze.",
    # Hindi Scams
    "आपका खाता बंद हो जाएगा, लिंक पर क्लिक करें",
    "लॉटरी विजेता! अभी कॉल करें",
    "केवाईसी अपडेट पेंडिंग है, तुरंत अपडेट करें"
]

# --- SAFE (Information + OTPs) ---
safe_msgs = [
    # The Fix for your Image (RBI/Info Messages)
    "वीडियो केवाईसी के माध्यम से कहीं से भी डिजिटल रूप से बैंक खाता खोलें - आरबीआई",
    "Open bank account digitally using Video KYC. It is fast and safe. - RBI",
    "RBI Kehta Hai: Never share your OTP or PIN with anyone.",
    "To report cyber fraud, dial 1930 immediately.",
    "Aadhaar and PAN linking is mandatory for filing taxes.",
    "Bank Alert: Rs 500 debited via UPI. Ref: 12345678.",
    # Marketing / Delivery
    "Rs.500 credited to your Nykaa Wallet. Use code NWS500.",
    "Amazon: Your package is out for delivery today.",
    "Your Uber ride is arriving in 2 minutes.",
    "Jio: Your plan expires in 3 days. Recharge to continue."
]

# Inject Data (Weighting it heavily so the model learns fast)
spam_df = pd.DataFrame({'message': threats * 15, 'is_spam': [1] * len(threats) * 15})
safe_df = pd.DataFrame({'message': safe_msgs * 15, 'is_spam': [0] * len(safe_msgs) * 15})

# Combine
df = pd.concat([df[['message', 'is_spam']], spam_df, safe_df], ignore_index=True)

# 3. Train
print(f"Training on {len(df)} messages (With RBI Context)...")

model = Pipeline([
    # 'char_wb' helps distinguish 'Link' vs 'No Link' context
    ('tfidf', TfidfVectorizer(ngram_range=(1, 4), analyzer='char_wb', max_features=100000)),
    ('classifier', LinearSVC(C=1.0)) 
])

X_train, X_test, y_train, y_test = train_test_split(df['message'], df['is_spam'], test_size=0.1, random_state=42)

model.fit(X_train, y_train)

# 4. Evaluate
preds = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, preds) * 100:.2f}%")

# 5. Save
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/text_model.pkl')
print("✅ Context-Aware Brain Saved!")

# --- TEST ---
print("\n--- FINAL TEST ---")
cases = [
    "Urgent: Your package delivery has been attempted. http://bit.ly/secure", # Scam
    "वीडियो केवाईसी के माध्यम से बैंक खाता खोलें", # Your RBI Image (Should be SAFE)
    "Rs.500 credited to your Nykaa Wallet" # Safe
]

for msg in cases:
    res = model.predict([msg])[0]
    print(f"'{msg[:20]}...' -> {'🛑 THREAT' if res==1 else '✅ SAFE'}")