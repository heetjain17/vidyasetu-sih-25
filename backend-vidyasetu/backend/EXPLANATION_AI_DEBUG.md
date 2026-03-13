# Explanation AI Troubleshooting Guide

## Issue
The explanation AI feature is not working - career and college explanations are showing "Explanation unavailable" instead of AI-generated text.

## Root Cause Analysis

### Implementation Details
The explanation AI feature is implemented in:
- **Backend**: `app/services/recommender_db.py` (lines 152-170)
- **Career Explanations**: `app/utils/explain_career_api.py`
- **College Explanations**: `app/utils/explain_college_multi.py`
- **LLM Client**: `app/utils/llm_client.py` → `app/utils/gemini_client.py`

### Current Status
1. ✅ Gemini API key is configured in `.env`
2. ✅ Gemini client initialization code exists
3. ⚠️ Silent failures - errors are caught but not logged
4. ❓ Unknown if Gemini API calls are actually failing

## Changes Made

### 1. Added Error Logging
**File**: `app/services/recommender_db.py`

Changed bare `except:` to `except Exception as e:` with logging:
```python
# Lines 157-159 (Career explanations)
except Exception as e:
    print(f"❌ Career explanation AI failed: {e}")
    career_exps = [{"career": c, "explanation": "Explanation unavailable"} for c in top_careers[:5]]

# Lines 168-170 (College explanations)
except Exception as e:
    print(f"❌ College explanation AI failed: {e}")
    college_exps = {c: "Explanation unavailable" for c in top_college_names}
```

## Debugging Steps

### Step 1: Check Backend Logs
When you restart the backend and trigger a recommendation, check the console output for:
- `✅ Gemini client initialized successfully` - Should appear on startup
- `❌ Career explanation AI failed: <error>` - Will show if career explanations fail
- `❌ College explanation AI failed: <error>` - Will show if college explanations fail
- `❌ Gemini generate_text failed: <error>` - From llm_client.py

### Step 2: Verify Gemini API Key
```bash
cd /home/anton/coding/vidyasetu-sih-25/backend-vidyasetu/backend
grep GEMINI_API_KEY .env
```

The key should be valid and not expired.

### Step 3: Test Gemini API Directly
Create a test script to verify Gemini is working:

```python
# test_gemini.py
from app.utils.gemini_client import generate_text, check_health

# Check health
print("Health check:", check_health())

# Test generation
try:
    result = generate_text("Say hello in one sentence")
    print("✅ Gemini working:", result)
except Exception as e:
    print("❌ Gemini failed:", e)
```

Run with:
```bash
cd /home/anton/coding/vidyasetu-sih-25/backend-vidyasetu/backend
python -c "from app.utils.gemini_client import generate_text, check_health; print(check_health()); print(generate_text('Say hello'))"
```

### Step 4: Check API Quota
Gemini API has rate limits. Check if you've exceeded them:
- Free tier: 15 requests per minute
- If exceeded, you'll get quota errors

### Step 5: Verify Model Names
Check that the model names in `.env` are correct:
```bash
GEMINI_MODEL=gemini-1.5-flash  # For text generation
GEMINI_EMBED_MODEL=models/gemini-embedding-001  # For embeddings
```

## Common Issues & Solutions

### Issue 1: API Key Invalid
**Symptom**: `⚠ GEMINI_API_KEY not found in environment variables`
**Solution**: 
1. Check `.env` file exists
2. Verify key is not commented out
3. Restart backend after adding key

### Issue 2: Rate Limit Exceeded
**Symptom**: `429 Too Many Requests` or quota errors
**Solution**:
1. Wait a minute before retrying
2. Consider upgrading API tier
3. Add rate limiting in code

### Issue 3: Model Not Found
**Symptom**: `Model not found` errors
**Solution**:
1. Use correct model name: `gemini-1.5-flash` or `gemini-1.5-pro`
2. Check Google AI Studio for available models

### Issue 4: Network/Firewall Issues
**Symptom**: Connection timeout or refused
**Solution**:
1. Check internet connection
2. Verify firewall allows HTTPS to `generativelanguage.googleapis.com`
3. Try with VPN if blocked

## Testing the Fix

### 1. Restart Backend
```bash
cd /home/anton/coding/vidyasetu-sih-25/backend-vidyasetu/backend
# Stop existing server (Ctrl+C)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Trigger Recommendation
1. Complete the assessment quiz in the web app
2. Submit and wait for recommendations
3. Check backend console for error messages
4. Check frontend - career explanations should appear when you click on each career

### 3. Expected Behavior
**Working**:
- Career cards show AI-generated explanations (3-5 sentences)
- College cards show why they match your profile
- No "Explanation unavailable" text

**Not Working**:
- "Explanation unavailable" appears
- Error messages in backend console
- Check logs for specific error

## Next Steps

1. **Immediate**: Restart the backend server to see error logs
2. **If errors appear**: Share the error message to diagnose the specific issue
3. **If no errors**: The feature might be working but frontend not displaying it correctly
4. **Alternative**: If Gemini continues to fail, consider:
   - Using a different LLM provider (OpenAI, Anthropic)
   - Implementing fallback explanations based on RIASEC traits
   - Pre-generating explanations and storing them

## Frontend Display

The explanations are displayed in:
- **File**: `src/components/dashboard/RecommendationsModule.tsx`
- **Lines**: 379-444 (Career explanations)
- **Lines**: 449+ (College explanations)

Each career is expandable - click to see the AI explanation.
