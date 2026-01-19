Markdown

# 🛡️ CyberShield AI: Next-Gen Phishing & Threat Detection Platform

![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=shield)
![Tech Stack](https://img.shields.io/badge/Stack-React%20|%20Flask%20|%20Gemini%20AI-blue?style=for-the-badge)

> **"Securing the digital frontier with Neural Networks & Generative AI."**
> An advanced cybersecurity platform designed to detect **Phishing URLs**, **Smishing SMS**, and **Malicious Screenshots** in real-time. 
> specifically fine-tuned for the **Indian Digital Ecosystem** (UPI, Banking, KYC scams).

---

## 🚀 Key Features

### 1. 🧠 AI-Powered Threat Detection
* **URL Scanner:** Detects malicious domains using entropy analysis and keyword heuristics (99.4% Accuracy).
* **Text Analysis:** Context-aware NLP model trained on Indian scam patterns (e.g., "Lottery", "KYC Update", "Electricity Bill").
* **OCR Vision:** Extracts text from screenshots/images to flag hidden visual threats.

### 2. 🤖 Generative AI Assistant (Gemini)
* Integrated **Google Gemini Pro** chatbot.
* Acts as a **Cybersecurity Expert** to answer user queries.
* **Multilingual Support:** Understands and replies in Indian languages (Hindi, Tamil, Telugu, etc.).

### 3. 🇮🇳 Indian Context Specialization
* **Whitelisted Trust Layer:** Recognizes 50+ trusted Indian brands (SBI, HDFC, Paytm, Jio, Zomato) to prevent false positives.
* **Helpline Integration:** Direct guidance to dial **1930** (National Cyber Crime Helpline) for detected threats.

### 4. 📊 Enterprise Grade Tools
* **Forensic PDF Reports:** Auto-generates downloadable reports for legal/official use.
* **Local History:** Saves recent scans for quick reference.
* **Live Dashboard:** Real-time latency tracking and confidence scores.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js + Vite | Ultra-fast UI with Framer Motion animations. |
| **Backend** | Python Flask | REST API handling ML inference and logic. |
| **AI Brain** | Scikit-Learn | `LinearSVC` models for Text & URL classification. |
| **GenAI** | Google Gemini API | Conversational intelligence for the chatbot. |
| **OCR** | Tesseract | Optical Character Recognition for image analysis. |
| **Styling** | TailwindCSS | Cyberpunk aesthetic (Neon/Dark mode). |

---

## ⚡ Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js 16+
* Tesseract OCR installed on your system.

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/CyberShield_AI.git](https://github.com/YourUsername/CyberShield_AI.git)
cd CyberShield_AI
2. Backend Setup
Bash

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python src/app.py
3. Frontend Setup
Bash

cd frontend
npm install
npm run dev
🧠 Model Training
The AI models are trained on a custom-augmented dataset that balances global threats with local context.

Dataset: Contains 5000+ Phishing URLs and 2000+ Indian SMS Spam examples.

Training Script:

Bash

python src/train_text_model.py
python src/train_url_model.py

🛡️ License
Distributed under the MIT License. See LICENSE for more information.

Built with ❤️ for a Safer Digital India.