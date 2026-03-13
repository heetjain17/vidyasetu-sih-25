# Gemini API Migration Guide

## Overview
The VidyaSetu backend has been migrated from OpenAI/Ollama to **Google Gemini API** using the OpenAI Python SDK for compatibility.

## What Changed

### Dependencies Removed
- ❌ `ollama` package
- ❌ `langchain-ollama`
- ❌ `langchain-openai`

### Dependencies Kept
- ✅ `openai>=1.109.1` (used for Gemini compatibility)
- ✅ All other dependencies remain unchanged

## Environment Variables

### Old Configuration (.env)
```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
OLLAMA_MODEL=llama3:instruct
```

### New Configuration (.env)
```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash  # Optional, defaults to gemini-1.5-flash
GEMINI_EMBED_MODEL=text-embedding-004  # Optional, for embeddings
```

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key
5. Add it to your `.env` file as `GEMINI_API_KEY`

## Files Modified

### New Files
- `app/utils/gemini_client.py` - Gemini client wrapper using OpenAI SDK

### Updated Files
- `requirements.txt` - Removed Ollama dependencies
- `.env.example` - Updated with Gemini configuration
- `app/utils/llm_client.py` - Now uses Gemini client
- `app/services/chatbot_service.py` - Migrated to Gemini
- `app/services/futuristic_career_generator.py` - Migrated to Gemini

## How It Works

The migration uses the **OpenAI Python SDK** to connect to Gemini API by:

1. Setting a custom `base_url` pointing to Gemini's OpenAI-compatible endpoint:
   ```python
   base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
   ```

2. Using the Gemini API key instead of OpenAI key:
   ```python
   client = OpenAI(
       api_key=GEMINI_API_KEY,
       base_url=GEMINI_BASE_URL
   )
   ```

3. All OpenAI SDK methods work as-is:
   - `client.chat.completions.create()` for text generation
   - `client.embeddings.create()` for embeddings
   - Streaming with `stream=True`

## Available Gemini Models

### Chat Models
- `gemini-1.5-flash` (default) - Fast, efficient
- `gemini-1.5-pro` - More capable, slower
- `gemini-2.0-flash-exp` - Latest experimental

### Embedding Models
- `text-embedding-004` (default)

## Installation

1. Update dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

## Testing

Test the chatbot endpoint:
```bash
curl -X POST http://localhost:8000/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What colleges are in Jammu?"}'
```

Check health status:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "qdrant": "ok",
  "ai_provider": "gemini",
  "model": "gemini-1.5-flash"
}
```

## Benefits of Gemini

1. **Cost-effective** - Gemini 1.5 Flash is very affordable
2. **Fast** - Low latency responses
3. **No local setup** - No need to run Ollama locally
4. **Reliable** - Google's infrastructure
5. **Compatible** - Works with OpenAI SDK

## Troubleshooting

### Error: "Gemini API not configured"
- Check that `GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid

### Error: "Failed to initialize Gemini client"
- Ensure `openai>=1.109.1` is installed
- Check internet connectivity
- Verify the base URL is correct

### Embeddings not working
- Make sure you're using a compatible embedding model
- Default is `text-embedding-004`

## Migration Checklist

- [x] Remove Ollama dependencies
- [x] Create Gemini client wrapper
- [x] Update chatbot service
- [x] Update LLM client
- [x] Update futuristic career generator
- [x] Update environment variables
- [x] Test all endpoints
- [x] Update documentation

## Rollback (if needed)

If you need to rollback to OpenAI/Ollama:

1. Restore old `requirements.txt`
2. Restore old service files from git history
3. Update `.env` with OpenAI/Ollama keys
4. Reinstall dependencies

## Support

For issues or questions:
- Check [Google AI Studio](https://aistudio.google.com/)
- Review [Gemini API docs](https://ai.google.dev/docs)
- See [OpenAI SDK docs](https://github.com/openai/openai-python)
