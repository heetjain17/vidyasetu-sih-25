"""
Migrate local Qdrant data to Qdrant Cloud
Run this script to transfer your existing vector database to the cloud.
"""
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

load_dotenv()

# Configuration
LOCAL_QDRANT_URL = os.getenv("LOCAL_QDRANT_URL", "http://localhost:6333")
CLOUD_QDRANT_URL = os.getenv("QDRANT_URL")
CLOUD_QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "college_career_knowledge_openai")

# Embedding dimensions (update based on your model)
# Gemini text-embedding-004: 768
# OpenAI text-embedding-3-small: 1536
VECTOR_SIZE = int(os.getenv("VECTOR_SIZE", "768"))


def migrate_collection(
    collection_name: str,
    local_url: str = LOCAL_QDRANT_URL,
    cloud_url: str = CLOUD_QDRANT_URL,
    cloud_api_key: str = CLOUD_QDRANT_API_KEY,
    batch_size: int = 100
):
    """
    Migrate a collection from local Qdrant to Qdrant Cloud.
    
    Args:
        collection_name: Name of the collection to migrate
        local_url: Local Qdrant URL
        cloud_url: Cloud Qdrant URL
        cloud_api_key: Cloud Qdrant API key
        batch_size: Number of points to migrate per batch
    """
    print(f"🚀 Starting migration of collection: {collection_name}")
    print(f"📍 From: {local_url}")
    print(f"☁️  To: {cloud_url}")
    print("-" * 60)
    
    # Connect to local Qdrant
    print("🔌 Connecting to local Qdrant...")
    try:
        local_client = QdrantClient(url=local_url)
        collections = local_client.get_collections()
        print(f"✅ Connected to local Qdrant ({len(collections.collections)} collections)")
    except Exception as e:
        print(f"❌ Failed to connect to local Qdrant: {e}")
        return False
    
    # Check if collection exists locally
    try:
        collection_info = local_client.get_collection(collection_name)
        vector_size = collection_info.config.params.vectors.size
        distance = collection_info.config.params.vectors.distance
        point_count = collection_info.points_count
        print(f"📊 Collection info:")
        print(f"   - Vectors: {point_count}")
        print(f"   - Dimensions: {vector_size}")
        print(f"   - Distance: {distance}")
    except Exception as e:
        print(f"❌ Collection '{collection_name}' not found locally: {e}")
        return False
    
    # Connect to cloud Qdrant
    print("\n🔌 Connecting to Qdrant Cloud...")
    try:
        cloud_client = QdrantClient(
            url=cloud_url,
            api_key=cloud_api_key
        )
        cloud_collections = cloud_client.get_collections()
        print(f"✅ Connected to Qdrant Cloud ({len(cloud_collections.collections)} collections)")
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant Cloud: {e}")
        print("💡 Make sure QDRANT_URL and QDRANT_API_KEY are set correctly in .env")
        return False
    
    # Create collection in cloud if it doesn't exist
    print(f"\n📦 Creating collection '{collection_name}' in cloud...")
    try:
        cloud_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=distance
            )
        )
        print(f"✅ Collection created successfully")
    except Exception as e:
        if "already exists" in str(e).lower():
            print(f"⚠️  Collection already exists in cloud")
            response = input("Do you want to continue and add/update points? (y/n): ")
            if response.lower() != 'y':
                print("❌ Migration cancelled")
                return False
        else:
            print(f"❌ Failed to create collection: {e}")
            return False
    
    # Migrate points in batches
    print(f"\n📤 Migrating {point_count} points in batches of {batch_size}...")
    offset = None
    total_migrated = 0
    
    while True:
        # Scroll through local collection
        points, next_offset = local_client.scroll(
            collection_name=collection_name,
            limit=batch_size,
            offset=offset,
            with_payload=True,
            with_vectors=True
        )
        
        if not points:
            break
        
        # Upload to cloud
        try:
            cloud_client.upsert(
                collection_name=collection_name,
                points=points
            )
            total_migrated += len(points)
            progress = (total_migrated / point_count) * 100
            print(f"   ✓ Migrated {total_migrated}/{point_count} points ({progress:.1f}%)")
        except Exception as e:
            print(f"   ❌ Failed to upload batch: {e}")
            return False
        
        # Update offset for next batch
        offset = next_offset
        if offset is None:
            break
    
    print(f"\n✅ Migration complete!")
    print(f"📊 Total points migrated: {total_migrated}")
    
    # Verify migration
    print("\n🔍 Verifying migration...")
    try:
        cloud_collection_info = cloud_client.get_collection(collection_name)
        cloud_point_count = cloud_collection_info.points_count
        print(f"   Cloud collection points: {cloud_point_count}")
        
        if cloud_point_count == point_count:
            print("✅ Verification successful! All points migrated.")
        else:
            print(f"⚠️  Point count mismatch: Local={point_count}, Cloud={cloud_point_count}")
    except Exception as e:
        print(f"⚠️  Could not verify migration: {e}")
    
    return True


def main():
    """Main migration function."""
    print("=" * 60)
    print("  Qdrant Cloud Migration Tool")
    print("=" * 60)
    print()
    
    # Check environment variables
    if not CLOUD_QDRANT_URL:
        print("❌ QDRANT_URL not set in .env")
        print("💡 Add your Qdrant Cloud URL to .env file")
        return
    
    if not CLOUD_QDRANT_API_KEY:
        print("❌ QDRANT_API_KEY not set in .env")
        print("💡 Add your Qdrant Cloud API key to .env file")
        return
    
    print(f"📝 Configuration:")
    print(f"   Local URL: {LOCAL_QDRANT_URL}")
    print(f"   Cloud URL: {CLOUD_QDRANT_URL}")
    print(f"   Collection: {COLLECTION_NAME}")
    print(f"   Vector Size: {VECTOR_SIZE}")
    print()
    
    # Confirm migration
    response = input("⚠️  This will migrate your local data to cloud. Continue? (y/n): ")
    if response.lower() != 'y':
        print("❌ Migration cancelled")
        return
    
    print()
    
    # Run migration
    success = migrate_collection(
        collection_name=COLLECTION_NAME,
        local_url=LOCAL_QDRANT_URL,
        cloud_url=CLOUD_QDRANT_URL,
        cloud_api_key=CLOUD_QDRANT_API_KEY
    )
    
    if success:
        print("\n" + "=" * 60)
        print("  🎉 Migration Successful!")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("1. Test your application with cloud Qdrant")
        print("2. Update .env to remove LOCAL_QDRANT_URL if needed")
        print("3. You can now stop your local Qdrant instance")
    else:
        print("\n" + "=" * 60)
        print("  ❌ Migration Failed")
        print("=" * 60)
        print("\n💡 Check the error messages above and try again")


if __name__ == "__main__":
    main()
