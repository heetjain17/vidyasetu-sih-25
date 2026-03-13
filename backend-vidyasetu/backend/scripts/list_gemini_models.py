"""
List available Gemini models to find the correct embedding model name.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not set in .env")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("=" * 70)
print("  Available Gemini Models")
print("=" * 70)
print()

print("📋 Listing all models...")
print()

for model in genai.list_models():
    print(f"Model: {model.name}")
    print(f"  Display Name: {model.display_name}")
    print(f"  Supported Methods: {', '.join(model.supported_generation_methods)}")
    print()

print("=" * 70)
print("  Looking for embedding models...")
print("=" * 70)
print()

embedding_models = []
for model in genai.list_models():
    if 'embedContent' in model.supported_generation_methods:
        embedding_models.append(model.name)
        print(f"✅ {model.name}")
        print(f"   Display: {model.display_name}")
        print()

if embedding_models:
    print("=" * 70)
    print(f"  Found {len(embedding_models)} embedding model(s)")
    print("=" * 70)
    print()
    print("Use this model name in your code:")
    print(f"  GEMINI_EMBED_MODEL = \"{embedding_models[0]}\"")
else:
    print("❌ No embedding models found!")
