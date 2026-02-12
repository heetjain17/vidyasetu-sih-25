"""
Embedding Script for RAG Data (OpenAI Version)
Creates embeddings using OpenAI and uploads to local Qdrant.

Usage:
    1. Start Qdrant: docker-compose up -d
    2. Set OPENAI_API_KEY in .env
    3. Run this script: python scripts/create_embeddings.py
"""

import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

load_dotenv()

# Configuration
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", None)
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "college_career_knowledge_openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")

# Data directory
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rag")

# Initialize clients
print(f"Connecting to Qdrant at {QDRANT_URL}...")
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

print(f"Initializing OpenAI embeddings with model {OPENAI_EMBED_MODEL}...")
openai_client = OpenAI(api_key=OPENAI_API_KEY)


def get_embedding(text: str) -> List[float]:
    """Get embedding for a single text using OpenAI."""
    response = openai_client.embeddings.create(
        model=OPENAI_EMBED_MODEL,
        input=text
    )
    return response.data[0].embedding


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Get embeddings for a batch of texts using OpenAI."""
    response = openai_client.embeddings.create(
        model=OPENAI_EMBED_MODEL,
        input=texts
    )
    return [item.embedding for item in response.data]


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
        print(f"Deleting existing collection '{COLLECTION_NAME}'...")
        qdrant_client.delete_collection(COLLECTION_NAME)
    
    print(f"Creating collection '{COLLECTION_NAME}' with vector size {vector_size}...")
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
    )


def load_json_file(filename: str) -> Any:
    """Load a JSON file from the data directory."""
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def process_colleges() -> List[Dict[str, Any]]:
    """Process colleges.json and create documents."""
    print("Processing colleges.json...")
    colleges = load_json_file("colleges.json")
    documents = []
    
    for college in colleges:
        name = college.get("Name") or college.get("name", "Unknown")
        district = college.get("district", "")
        state = college.get("state", "Jammu and Kashmir")
        hostel = college.get("Hostel", "No")
        fees = college.get("Fees", "")
        
        text = f"College: {name} located in {district}, {state}. Hostel: {hostel}. Fees: {fees}"
        
        documents.append({
            "text": text,
            "type": "college_info",
            "college_name": name,
            "district": district,
            "state": state,
            "hostel": hostel,
            "fees": str(fees) if fees else "",
        })
    
    print(f"  Created {len(documents)} college documents")
    return documents


def process_courses() -> List[Dict[str, Any]]:
    """Process courses.json and create documents."""
    print("Processing courses.json...")
    courses = load_json_file("courses.json")
    documents = []
    
    for course in courses:
        name = course.get("name", "Unknown")
        stream = course.get("stream", "")
        
        text = f"Course: {name} in {stream} stream"
        
        documents.append({
            "text": text,
            "type": "course",
            "course_name": name,
            "stream": stream,
        })
    
    print(f"  Created {len(documents)} course documents")
    return documents


def process_career_to_course() -> List[Dict[str, Any]]:
    """Process Career_to_course.json and create documents."""
    print("Processing Career_to_course.json...")
    career_to_course = load_json_file("Career_to_course.json")
    documents = []
    
    for career, courses in career_to_course.items():
        courses_str = ", ".join(courses[:10])  # Limit to avoid very long texts
        text = f"Career: {career}. Recommended courses: {courses_str}"
        
        documents.append({
            "text": text,
            "type": "career_to_course",
            "career_name": career,
            "courses": courses,
        })
    
    print(f"  Created {len(documents)} career-to-course documents")
    return documents


def process_course_to_college() -> List[Dict[str, Any]]:
    """Process Course_to_college.json and create documents."""
    print("Processing Course_to_college.json...")
    course_to_college = load_json_file("Course_to_college.json")
    documents = []
    
    for course, colleges in course_to_college.items():
        colleges_str = ", ".join(colleges[:10])  # Limit to avoid very long texts
        text = f"Course: {course}. Offered at colleges: {colleges_str}"
        
        documents.append({
            "text": text,
            "type": "course_to_college",
            "course_name": course,
            "colleges": colleges,
        })
    
    print(f"  Created {len(documents)} course-to-college documents")
    return documents


def embed_and_upload(documents: List[Dict[str, Any]], batch_size: int = 100):
    """Embed documents in batches and upload to Qdrant."""
    total = len(documents)
    print(f"\nEmbedding and uploading {total} documents...")
    
    points = []
    texts = [doc["text"] for doc in documents]
    
    # Process in batches for efficiency
    for i in range(0, total, batch_size):
        batch_texts = texts[i:i + batch_size]
        batch_docs = documents[i:i + batch_size]
        
        print(f"  Processing batch {i // batch_size + 1}/{(total + batch_size - 1) // batch_size}...")
        
        # Get embeddings for batch
        embeddings = get_embeddings_batch(batch_texts)
        
        # Create points
        for j, (doc, embedding) in enumerate(zip(batch_docs, embeddings)):
            payload = {k: v for k, v in doc.items() if k != "text"}
            point = PointStruct(
                id=i + j,
                vector=embedding,
                payload=payload
            )
            points.append(point)
        
        # Upload batch
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points[-len(batch_texts):]
        )
    
    print(f"  Uploaded all {total} documents!")


def main():
    print("=" * 60)
    print("RAG Embedding Script (OpenAI)")
    print("=" * 60)
    
    if not OPENAI_API_KEY:
        print("ERROR: OPENAI_API_KEY not set in .env file!")
        return
    
    # Get embedding dimension
    print("\nTesting OpenAI embedding model...")
    vector_size = get_embedding_dimension()
    print(f"Embedding dimension: {vector_size}")
    
    # Create collection
    create_collection(vector_size)
    
    # Process all data files
    all_documents = []
    all_documents.extend(process_colleges())
    all_documents.extend(process_courses())
    all_documents.extend(process_career_to_course())
    all_documents.extend(process_course_to_college())
    
    print(f"\nTotal documents to embed: {len(all_documents)}")
    
    # Embed and upload
    embed_and_upload(all_documents)
    
    # Verify
    collection_info = qdrant_client.get_collection(COLLECTION_NAME)
    print(f"\n✅ Collection '{COLLECTION_NAME}' created successfully!")
    print(f"   Points count: {collection_info.points_count}")
    print(f"   Vector size: {collection_info.config.params.vectors.size}")
    
    print("\n" + "=" * 60)
    print("Done! You can now use the chatbot.")
    print("=" * 60)


if __name__ == "__main__":
    main()
