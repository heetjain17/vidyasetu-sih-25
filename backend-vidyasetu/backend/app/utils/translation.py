import asyncio
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator

# Thread pool for parallel translations
_executor = ThreadPoolExecutor(max_workers=5)

LANG_CODE_MAP = {
    "english": "en",
    "hindi": "hi",
    "urdu": "ur",
    "kashmiri": "ks",  # deep-translator supports 'auto' and standard codes
    "dogri": "doi",
}

def translate_text(text: str, target_language: str) -> str:
    """
    Translates text to target_language using Google Translate (via deep-translator).
    Returns original text if error occurs.
    """
    lang_key = target_language.lower()
    
    # deep-translator uses 'en' etc.
    target_code = LANG_CODE_MAP.get(lang_key, "en")
    
    if target_code == "en":
        return text

    if not text or not text.strip():
        return text

    try:
        translator = GoogleTranslator(source='auto', target=target_code)
        return translator.translate(text)
    except Exception as e:
        print(f"⚠ Translation error for {target_language} ({target_code}): {e}")
        return text

async def translate_text_async(text: str, target_language: str) -> str:
    """Async wrapper for translate_text using thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, translate_text, text, target_language)

async def translate_to_all_langs(text: str, exclude_english: bool = True) -> dict:
    """
    Translate text to all supported languages in parallel.
    Returns dict: {"english": "...", "hindi": "...", "urdu": "...", "kashmiri": "...", "dogri": "..."}
    """
    result = {"english": text}
    
    if not text:
        return {lang: "" for lang in LANG_CODE_MAP.keys()}
    
    langs_to_translate = ["hindi", "urdu", "kashmiri", "dogri"] if exclude_english else list(LANG_CODE_MAP.keys())
    
    # Run all translations in parallel
    tasks = [translate_text_async(text, lang) for lang in langs_to_translate]
    translations = await asyncio.gather(*tasks, return_exceptions=True)
    
    for lang, translation in zip(langs_to_translate, translations):
        if isinstance(translation, Exception):
            result[lang] = text  # Fallback to English
        else:
            result[lang] = translation
    
    return result

async def translate_batch_parallel(texts_and_langs: list[tuple[str, str]]) -> list[str]:
    """
    Translate multiple (text, language) pairs in parallel.
    Returns list of translated texts in same order.
    """
    tasks = [translate_text_async(text, lang) for text, lang in texts_and_langs]
    return await asyncio.gather(*tasks, return_exceptions=True)
