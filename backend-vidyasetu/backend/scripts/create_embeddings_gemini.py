"""
Embedding Script for RAG Data (Gemini Version)
Creates embeddings using Google Gemini API and uploads to Qdrant (local or cloud).

Usage:
    1. Set GEMINI_API_KEY in .env
    2. Set QDRANT_URL and QDRANT_API_KEY in .env (for cloud) or use local
    3. Run this script: python scripts/create_embeddings_gemini.py
"""

import os
import sys
import json
import time
from typing import List, Dict, Any

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.utils.gemini_client import get_embedding, GEMINI_EMBED_MODEL
from google.api_core.exceptions import ResourceExhausted

load_dotenv()

# Configuration
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", None)
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "college_career_knowledge_gemini")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Data directory
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rag")

# Initialize Qdrant client
print(f"🔌 Connecting to Qdrant at {QDRANT_URL}...")
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)


def get_embeddings_batch(
    texts: List[str], delay_between_requests: float = 0.6
) -> List[List[float]]:
    """
    Get embeddings for a batch of texts using Gemini with rate limiting.

    Args:
        texts: List of texts to embed
        delay_between_requests: Delay in seconds between requests (default 0.6s = 100 req/min)

    Returns:
        List of embeddings
    """
    embeddings = []
    total = len(texts)

    for i, text in enumerate(texts):
        if (i + 1) % 10 == 0:
            print(f"    Embedding {i + 1}/{total}...", end="\r")

        # Retry logic for rate limits
        max_retries = 3
        for attempt in range(max_retries):
            try:
                embedding = get_embedding(text)
                embeddings.append(embedding)

                # Add delay between requests to stay under rate limit
                if i < total - 1:  # Don't delay after last request
                    time.sleep(delay_between_requests)
                break

            except Exception as e:
                if "ResourceExhausted" in str(type(e).__name__) or "429" in str(e):
                    # Extract retry delay from error message if available
                    retry_delay = 60  # Default 1 minute
                    if "retry in" in str(e).lower():
                        try:
                            import re

                            match = re.search(r"retry in (\d+\.?\d*)s", str(e))
                            if match:
                                retry_delay = (
                                    float(match.group(1)) + 1
                                )  # Add 1 second buffer
                        except:
                            pass

                    print(
                        f"\n    ⚠️  Rate limit hit. Waiting {retry_delay:.0f} seconds..."
                    )
                    time.sleep(retry_delay)

                    if attempt < max_retries - 1:
                        print(f"    🔄 Retrying ({attempt + 2}/{max_retries})...")
                    else:
                        raise
                else:
                    raise

    print(f"    Embedded {total}/{total} texts    ")
    return embeddings


def get_embedding_dimension() -> int:
    """Get the dimension of the embedding model."""
    test_embedding = get_embedding("test")
    return len(test_embedding)


def create_collection(vector_size: int):
    """Create or recreate the Qdrant collection."""
    # Check if collection exists
    collections = qdrant_client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME in collection_names:
        print(f"⚠️  Collection '{COLLECTION_NAME}' already exists.")
        response = input("Delete and recreate? (y/n): ")
        if response.lower() == "y":
            print(f"🗑️  Deleting existing collection '{COLLECTION_NAME}'...")
            qdrant_client.delete_collection(COLLECTION_NAME)
        else:
            print("❌ Cancelled. Exiting...")
            exit(0)

    print(
        f"📦 Creating collection '{COLLECTION_NAME}' with vector size {vector_size}..."
    )
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )
    print(f"✅ Collection created successfully!")


def load_json_file(filename: str) -> Any:
    """Load a JSON file from the data directory."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"⚠️  Warning: {filename} not found at {filepath}")
        return None

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def process_colleges() -> List[Dict[str, Any]]:
    """Process colleges.json and create documents."""
    print("📚 Processing colleges.json...")
    colleges = load_json_file("colleges.json")

    if not colleges:
        print("  ⚠️  No colleges data found, skipping...")
        return []

    documents = []

    for college in colleges:
        name = college.get("Name") or college.get("name", "Unknown")
        district = college.get("district", "")
        state = college.get("state", "Jammu and Kashmir")
        hostel = college.get("Hostel", "No")
        fees = college.get("Fees", "")

        text = f"College: {name} located in {district}, {state}. Hostel: {hostel}. Fees: {fees}"

        documents.append(
            {
                "text": text,
                "type": "college_info",
                "college_name": name,
                "district": district,
                "state": state,
                "hostel": hostel,
                "fees": str(fees) if fees else "",
            }
        )

    print(f"  ✅ Created {len(documents)} college documents")
    return documents


def process_courses() -> List[Dict[str, Any]]:
    """Process courses.json and create documents."""
    print("📚 Processing courses.json...")
    courses = load_json_file("courses.json")

    if not courses:
        print("  ⚠️  No courses data found, skipping...")
        return []

    documents = []

    for course in courses:
        name = course.get("name", "Unknown")
        stream = course.get("stream", "")

        text = f"Course: {name} in {stream} stream"

        documents.append(
            {
                "text": text,
                "type": "course",
                "course_name": name,
                "stream": stream,
            }
        )

    print(f"  ✅ Created {len(documents)} course documents")
    return documents


def process_career_to_course() -> List[Dict[str, Any]]:
    """Process Career_to_course.json and create documents."""
    print("📚 Processing Career_to_course.json...")
    career_to_course = load_json_file("Career_to_course.json")

    if not career_to_course:
        print("  ⚠️  No career-to-course data found, skipping...")
        return []

    documents = []

    for career, courses in career_to_course.items():
        courses_str = ", ".join(courses[:10])  # Limit to avoid very long texts
        text = f"Career: {career}. Recommended courses: {courses_str}"

        documents.append(
            {
                "text": text,
                "type": "career_to_course",
                "career_name": career,
                "courses": courses,
            }
        )

    print(f"  ✅ Created {len(documents)} career-to-course documents")
    return documents


def process_course_to_college() -> List[Dict[str, Any]]:
    """Process Course_to_college.json and create documents."""
    print("📚 Processing Course_to_college.json...")
    course_to_college = load_json_file("Course_to_college.json")

    if not course_to_college:
        print("  ⚠️  No course-to-college data found, skipping...")
        return []

    documents = []

    for course, colleges in course_to_college.items():
        colleges_str = ", ".join(colleges[:10])  # Limit to avoid very long texts
        text = f"Course: {course}. Offered at colleges: {colleges_str}"

        documents.append(
            {
                "text": text,
                "type": "course_to_college",
                "course_name": course,
                "colleges": colleges,
            }
        )

    print(f"  ✅ Created {len(documents)} course-to-college documents")
    return documents


def embed_and_upload(documents: List[Dict[str, Any]], batch_size: int = 50):
    """Embed documents in batches and upload to Qdrant."""
    total = len(documents)
    print(f"\n🚀 Embedding and uploading {total} documents...")
    print(f"   Using Gemini model: {GEMINI_EMBED_MODEL}")
    print(f"   Batch size: {batch_size}")

    points = []
    texts = [doc["text"] for doc in documents]

    # Process in batches for efficiency
    for i in range(0, total, batch_size):
        batch_texts = texts[i : i + batch_size]
        batch_docs = documents[i : i + batch_size]

        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size
        print(
            f"\n  📦 Batch {batch_num}/{total_batches} ({len(batch_texts)} documents):"
        )

        # Get embeddings for batch
        embeddings = get_embeddings_batch(batch_texts)

        # Create points
        batch_points = []
        for j, (doc, embedding) in enumerate(zip(batch_docs, embeddings)):
            payload = {k: v for k, v in doc.items() if k != "text"}
            point = PointStruct(id=i + j, vector=embedding, payload=payload)
            batch_points.append(point)

        # Upload batch
        print(f"    ⬆️  Uploading to Qdrant...")
        qdrant_client.upsert(collection_name=COLLECTION_NAME, points=batch_points)
        print(f"    ✅ Uploaded {len(batch_points)} points")

    print(f"\n✅ All {total} documents uploaded successfully!")


def main():
    print("=" * 70)
    print("  RAG Embedding Script (Google Gemini)")
    print("=" * 70)
    print()

    # Check API key
    if not GEMINI_API_KEY:
        print("❌ ERROR: GEMINI_API_KEY not set in .env file!")
        print("💡 Get your API key from: https://aistudio.google.com/app/apikey")
        return

    print(f"📝 Configuration:")
    print(f"   Qdrant URL: {QDRANT_URL}")
    print(f"   Collection: {COLLECTION_NAME}")
    print(f"   Gemini Model: {GEMINI_EMBED_MODEL}")
    print()

    # Test Gemini connection
    print("🧪 Testing Gemini API connection...")
    try:
        vector_size = get_embedding_dimension()
        print(f"✅ Gemini API working! Embedding dimension: {vector_size}")
    except Exception as e:
        print(f"❌ Failed to connect to Gemini API: {e}")
        print("💡 Check your GEMINI_API_KEY in .env")
        return

    # Test Qdrant connection
    print("\n🧪 Testing Qdrant connection...")
    try:
        collections = qdrant_client.get_collections()
        print(f"✅ Qdrant connected! Found {len(collections.collections)} collections")
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant: {e}")
        print("💡 Check your QDRANT_URL and QDRANT_API_KEY in .env")
        return

    print()

    # Create collection
    create_collection(vector_size)

    # Process all data files
    print("\n" + "=" * 70)
    print("  Processing Data Files")
    print("=" * 70)

    all_documents = []
    all_documents.extend(process_colleges())
    all_documents.extend(process_courses())
    all_documents.extend(process_career_to_course())
    all_documents.extend(process_course_to_college())

    if not all_documents:
        print("\n❌ No documents to process!")
        print("💡 Make sure you have data files in: " + DATA_DIR)
        return

    print(f"\n📊 Total documents to embed: {len(all_documents)}")

    # Confirm before proceeding
    response = input(
        "\n⚠️  Proceed with embedding? This may take a few minutes. (y/n): "
    )
    if response.lower() != "y":
        print("❌ Cancelled")
        return

    # Embed and upload
    embed_and_upload(all_documents)

    # Verify
    print("\n" + "=" * 70)
    print("  Verification")
    print("=" * 70)

    collection_info = qdrant_client.get_collection(COLLECTION_NAME)
    print(f"\n✅ Collection '{COLLECTION_NAME}' ready!")
    print(f"   📊 Points count: {collection_info.points_count}")
    print(f"   📏 Vector size: {collection_info.config.params.vectors.size}")
    print(f"   📍 Distance metric: {collection_info.config.params.vectors.distance}")

    print("\n" + "=" * 70)
    print("  🎉 Success! Your chatbot is ready to use.")
    print("=" * 70)
    print("\n💡 Next steps:")
    print("   1. Start your backend: uvicorn app.main:app --reload")
    print("   2. Test the chatbot endpoint")
    print("   3. Enjoy your AI-powered educational assistant!")
    print()


if __name__ == "__main__":
    main()
