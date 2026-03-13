# Cloud Vector Database Migration Guide

## Overview
This guide helps you migrate from local Qdrant to a cloud-based vector database solution for VidyaSetu.

---

## 🎯 Recommended Cloud Vector Databases

### 1. **Qdrant Cloud** ⭐ (Recommended)
**Best for:** Easy migration from local Qdrant

**Pros:**
- ✅ Same API as local Qdrant (zero code changes)
- ✅ Generous free tier (1GB storage)
- ✅ Excellent performance
- ✅ Built-in backups and scaling
- ✅ Easy migration path

**Pricing:**
- Free tier: 1GB storage, 100K vectors
- Paid: Starting at $25/month for 4GB

**Setup:**
```bash
# 1. Sign up at https://cloud.qdrant.io/
# 2. Create a cluster
# 3. Get your cluster URL and API key
# 4. Update .env:
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-api-key
```

**Migration:** ZERO code changes needed! ✨

---

### 2. **Pinecone**
**Best for:** Serverless, fully managed solution

**Pros:**
- ✅ Serverless (pay per usage)
- ✅ Free tier available
- ✅ Auto-scaling
- ✅ Good documentation
- ✅ Built-in metadata filtering

**Pricing:**
- Free tier: 1 index, 100K vectors
- Paid: Starting at $70/month

**Setup:**
```python
# Install
pip install pinecone-client

# Code changes needed
from pinecone import Pinecone

pc = Pinecone(api_key="your-api-key")
index = pc.Index("vidyasetu-index")

# Search
results = index.query(
    vector=embedding,
    top_k=10,
    include_metadata=True
)
```

---

### 3. **Weaviate Cloud**
**Best for:** Advanced semantic search with GraphQL

**Pros:**
- ✅ Free tier (14-day sandbox)
- ✅ GraphQL API
- ✅ Built-in vectorization
- ✅ Hybrid search (vector + keyword)
- ✅ Multi-tenancy support

**Pricing:**
- Sandbox: Free for 14 days
- Paid: Starting at $25/month

**Setup:**
```python
# Install
pip install weaviate-client

# Code
import weaviate

client = weaviate.Client(
    url="https://your-cluster.weaviate.network",
    auth_client_secret=weaviate.AuthApiKey(api_key="your-key")
)
```

---

### 4. **Milvus (Zilliz Cloud)**
**Best for:** Large-scale deployments

**Pros:**
- ✅ Open-source (Milvus) with cloud option
- ✅ High performance
- ✅ Good for billions of vectors
- ✅ Multiple index types

**Pricing:**
- Free tier: Limited
- Paid: Starting at $0.10/hour

---

### 5. **Chroma Cloud** (Coming Soon)
**Best for:** Simple, developer-friendly

**Pros:**
- ✅ Very simple API
- ✅ Open-source
- ✅ Good for prototyping
- ⚠️ Cloud version in beta

---

## 🔧 Embedding Generation Platforms

### Option 1: **Google Gemini Embeddings** ⭐ (Recommended - Already Integrated!)
**You're already set up for this!**

```python
# Already in your code via gemini_client.py
from app.utils.gemini_client import get_embedding

embedding = get_embedding("Your text here")
# Returns: List[float] with 768 dimensions
```

**Pros:**
- ✅ Already integrated with your Gemini migration
- ✅ Free tier: 1500 requests/day
- ✅ Model: `text-embedding-004`
- ✅ 768 dimensions
- ✅ Multilingual support

**Pricing:**
- Free: 1500 requests/day
- Paid: $0.00001 per 1K characters

---

### Option 2: **OpenAI Embeddings**
**If you want to use OpenAI instead**

```python
from openai import OpenAI

client = OpenAI(api_key="your-openai-key")
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)
embedding = response.data[0].embedding
# Returns: 1536 dimensions
```

**Models:**
- `text-embedding-3-small`: 1536 dims, $0.02/1M tokens
- `text-embedding-3-large`: 3072 dims, $0.13/1M tokens

---

### Option 3: **Cohere Embeddings**
**Good for multilingual**

```python
import cohere

co = cohere.Client("your-api-key")
response = co.embed(
    texts=["Your text here"],
    model="embed-english-v3.0"
)
embedding = response.embeddings[0]
```

**Models:**
- `embed-english-v3.0`: 1024 dims
- `embed-multilingual-v3.0`: 1024 dims

**Pricing:**
- Free tier: 100 API calls/month
- Paid: $0.10/1K requests

---

### Option 4: **Voyage AI**
**Specialized for retrieval**

```python
import voyageai

vo = voyageai.Client(api_key="your-api-key")
result = vo.embed(
    ["Your text here"],
    model="voyage-2"
)
embedding = result.embeddings[0]
```

**Pricing:**
- $0.12/1M tokens

---

## 🚀 Recommended Setup for VidyaSetu

### **Best Combination:**
```
Gemini Embeddings + Qdrant Cloud
```

**Why?**
1. ✅ **Gemini Embeddings** - Already integrated, free tier, good quality
2. ✅ **Qdrant Cloud** - Zero code changes, free tier, easy migration

---

## 📝 Migration Steps (Qdrant Cloud)

### Step 1: Create Qdrant Cloud Account
```bash
# 1. Visit https://cloud.qdrant.io/
# 2. Sign up (free)
# 3. Create a new cluster
# 4. Note your cluster URL and API key
```

### Step 2: Update Environment Variables
```bash
# In your .env file:
QDRANT_URL=https://xyz-abc-123.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-cloud-api-key
QDRANT_COLLECTION_NAME=college_career_knowledge_gemini
```

### Step 3: Migrate Existing Data (Optional)
If you have local data to migrate:

```python
# migrate_to_cloud.py
from qdrant_client import QdrantClient

# Local client
local_client = QdrantClient(url="http://localhost:6333")

# Cloud client
cloud_client = QdrantClient(
    url="https://your-cluster.cloud.qdrant.io",
    api_key="your-api-key"
)

# Get collection info
collection_info = local_client.get_collection("your_collection")

# Create collection in cloud
cloud_client.create_collection(
    collection_name="your_collection",
    vectors_config=collection_info.config.params.vectors
)

# Scroll and upload points in batches
offset = None
batch_size = 100

while True:
    points, offset = local_client.scroll(
        collection_name="your_collection",
        limit=batch_size,
        offset=offset
    )
    
    if not points:
        break
    
    cloud_client.upsert(
        collection_name="your_collection",
        points=points
    )
    
    print(f"Migrated {len(points)} points")

print("Migration complete!")
```

### Step 4: Test Connection
```python
# test_cloud_connection.py
from app.services.chatbot_service import check_health

health = check_health()
print(health)
# Expected: {"qdrant": "ok", "ai_provider": "gemini"}
```

### Step 5: Re-generate Embeddings (If Needed)
If switching embedding models:

```bash
# Update your embedding script to use Gemini
python scripts/create_embeddings.py
```

---

## 💰 Cost Comparison

### Free Tier Limits:

| Platform | Storage | Vectors | Requests/Day |
|----------|---------|---------|--------------|
| **Qdrant Cloud** | 1GB | ~100K | Unlimited |
| **Pinecone** | - | 100K | - |
| **Weaviate** | 14 days | Unlimited | - |
| **Gemini Embeddings** | - | - | 1500 |

### Estimated Monthly Costs (Small Project):
- **Gemini Embeddings**: $0 (within free tier)
- **Qdrant Cloud**: $0 (within free tier)
- **Total**: **$0/month** 🎉

### Estimated Monthly Costs (Production):
- **Gemini Embeddings**: ~$5-10/month
- **Qdrant Cloud**: $25/month (4GB)
- **Total**: **~$30-35/month**

---

## 🔄 Code Changes Required

### For Qdrant Cloud:
```python
# NO CODE CHANGES! Just update .env:
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-api-key
```

### For Pinecone:
```python
# Significant changes needed in chatbot_service.py
# Replace Qdrant client with Pinecone client
```

### For Weaviate:
```python
# Moderate changes needed
# Replace Qdrant client with Weaviate client
```

---

## ✅ Recommended Action Plan

1. **Immediate (Free Tier):**
   - ✅ Keep Gemini embeddings (already done!)
   - ✅ Migrate to Qdrant Cloud free tier
   - ✅ Zero code changes needed
   - ✅ Test thoroughly

2. **When Scaling:**
   - Consider upgrading Qdrant Cloud plan
   - Monitor embedding API usage
   - Implement caching for frequently accessed vectors

3. **Future Optimization:**
   - Batch embedding generation
   - Implement vector caching
   - Use hybrid search (vector + keyword)

---

## 🛠️ Troubleshooting

### Connection Issues:
```python
# Test connection
from qdrant_client import QdrantClient

client = QdrantClient(
    url="https://your-cluster.cloud.qdrant.io",
    api_key="your-api-key"
)

# Should work without errors
collections = client.get_collections()
print(collections)
```

### Embedding Dimension Mismatch:
- Gemini: 768 dimensions
- OpenAI (small): 1536 dimensions
- Make sure your vector DB collection matches!

---

## 📚 Additional Resources

- [Qdrant Cloud Docs](https://qdrant.tech/documentation/cloud/)
- [Gemini Embeddings API](https://ai.google.dev/docs/embeddings_guide)
- [Vector DB Comparison](https://github.com/erikbern/ann-benchmarks)

---

## 🎯 Summary

**Best Setup for VidyaSetu:**
```
✅ Gemini API (text-embedding-004) - Already integrated!
✅ Qdrant Cloud - Zero code changes
✅ Total Cost: $0/month (free tier)
```

**Next Steps:**
1. Create Qdrant Cloud account
2. Update `.env` with cloud credentials
3. Optionally migrate existing data
4. Test and deploy!
