# src/train_url_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from feature_extraction import URLFeatureExtractor
import os

# 1. Load Data
print("Loading dataset...")
# Make sure the file name matches exactly what you downloaded!
df = pd.read_csv('dataset/malicious_phish.csv') 

# Let's take a smaller sample for testing (e.g., 50,000 rows) to save time initially.
# Once it works, you can comment this line out to train on the full data.
df = df.sample(n=50000, random_state=42)

print(f"Dataset loaded. Rows: {len(df)}")

# 2. Extract Features (The Slow Part)
print("Extracting features... this might take a minute.")

# We apply your Class to every URL in the dataframe
# We need to turn the 'type' (benign/phishing) into numbers: 0 for benign, 1 for malicious
# Note: Adjust 'type' and 'url' based on your actual CSV column names
# Common column names in Kaggle datasets are 'url' and 'type' or 'label'

# Let's assume standard names, but we handle variations:
url_col = 'url' if 'url' in df.columns else 'URL'
type_col = 'type' if 'type' in df.columns else 'Label'

# Convert labels to 0 (safe) and 1 (unsafe)
# 'benign' usually means safe. Everything else (phishing, defacement, malware) is bad.
df['is_malicious'] = df[type_col].apply(lambda x: 0 if x == 'benign' else 1)

# Extract numerical features
features_list = []
for url in df[url_col]:
    extractor = URLFeatureExtractor(url)
    features_list.append(extractor.get_features())

X = np.array(features_list)
y = df['is_malicious'].values

# 3. Split Data (80% for training, 20% for testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the Model (Random Forest)
print("Training Random Forest Model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Accuracy: {accuracy * 100:.2f}%")
print("\nDetailed Report:")
print(classification_report(y_test, predictions))

# 6. Save the Brain
# We save the model to a file so we can load it later in the API
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/url_model.pkl')
print("Model saved to models/url_model.pkl")