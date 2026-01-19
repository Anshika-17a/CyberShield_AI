import google.generativeai as genai

genai.configure(api_key="AIzaSyD4ddx0sQYyEYP8kdQ1HVwOE8Z55ox7zW0")

# We will list available models to see what your key can access
print("🔍 Checking available models...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f" - {m.name}")

print("\n🧪 Testing connection...")
try:
    # We use 'gemini-pro' because it's the standard
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello!")
    print(f"✅ SUCCESS! Reply: {response.text}")
except Exception as e:
    print(f"❌ ERROR: {e}")