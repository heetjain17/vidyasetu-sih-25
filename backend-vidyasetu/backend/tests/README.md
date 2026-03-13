# tests/ — Test Suite

## Running Tests
```bash
# Activate your conda env first
conda activate vidyasetu-backend

# Run all tests
pytest tests/ -v

# Run a specific file
pytest tests/test_schemas.py -v

# Run quietly (no verbose)
pytest tests/ -q
```

## Test Files

| File | Type | Tests | Description |
|---|---|---|---|
| `test_schemas.py` | Unit | 10 | Pure Pydantic schema validation — no network required |
| `test_recommend.py` | Integration | 6 | `/recommend/` endpoint: valid payload, missing fields, range violations, method check, translate |
| `test_colleges.py` | Integration | 7 | `/colleges/` endpoint: list, search, pagination, filters, 404 |
| `test_data.py` | Integration | 7 | `/data/` table endpoints + `/roadmaps/` list and 404 |
| `test_chatbot.py` | Integration | 4 | `/chatbot/ask` + `/chatbot/health` |
| `test_auth.py` | Integration | 2 | Login flow + health sanity check |
| `test_health.py` | Integration | 1 | `/health/` endpoint |
| `test_calendar_sync.py` | Script | 1 | Google Calendar sync (requires `GOOGLE_APPLICATION_CREDENTIALS`) |
| `test_subscription_mock.py` | Script | 1 | WhatsApp/n8n webhook (requires `N8N_WHATSAPP_WEBHOOK`) |

**Total: 39 tests, 0 failures**

## Notes
- `conftest.py` adds the project root to `sys.path` — required for `from app.x import y` imports.
- `pytest.ini` sets `asyncio_mode = auto` for async test functions.
- Auth tests hit **live Supabase** — they need a valid `.env` file.
- Schema tests (`test_schemas.py`) run fully **offline** — fastest to iterate with.
- Calendar and WhatsApp tests are integration scripts; they only run if the respective env vars are set.
