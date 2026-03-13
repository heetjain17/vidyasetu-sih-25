"""
Chatbot Router
WebSocket streaming endpoint and REST fallback for RAG-based chatbot.
Uses OpenAI for LLM and Qdrant for vector search.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.chatbot import ChatRequest, ChatResponse, HealthResponse
from app.schemas.chatbot_futuristic import FuturisticCareerRequest, FuturisticCareerItem, FuturisticCareerResponse
from app.services.chatbot_service import rag_answer_stream, rag_answer, check_health
import json

router = APIRouter()


# ---------- WebSocket Streaming Endpoint ----------
@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for streaming chat responses.
    
    Client sends: {"question": "..."}
    Server streams: {"type": "token", "content": "..."} for each token
    Server ends with: {"type": "complete", "answer": "...", "sources": [...]}
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                question = message.get("question", "").strip()
                
                if not question:
                    await websocket.send_json({
                        "type": "error",
                        "content": "Question cannot be empty"
                    })
                    continue
                
                # Stream the response
                async for chunk in rag_answer_stream(question):
                    await websocket.send_json(chunk)
                    
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "content": "Invalid JSON format"
                })
                
    except WebSocketDisconnect:
        pass  # Client disconnected, no action needed
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "content": f"Server error: {str(e)}"
            })
        except:
            pass  # Connection may already be closed


# ---------- REST Endpoint (Fallback) ----------
@router.post("/ask", response_model=ChatResponse, summary="Ask a question (non-streaming)")
def ask_question(request: ChatRequest):
    """
    REST endpoint for asking questions (non-streaming).
    Use WebSocket /chatbot/ws for streaming responses.
    
    Note: This endpoint may take 10-60 seconds for complex queries
    due to local LLM inference.
    """
    answer_dict, sources = rag_answer(request.question)
    
    return ChatResponse(
        answer=answer_dict.get("answer", ""),
        sources=sources if sources else None,
        colleges=answer_dict.get("colleges"),
        career_cards=answer_dict.get("career_cards"),
        # Add support for futuristic fields in case they flow through here in future
        # futuristic_careers=answer_dict.get("futuristic_careers"),
        # is_futuristic_query=answer_dict.get("is_futuristic_query")
    )


# ---------- Health Check ----------
@router.get("/health", response_model=HealthResponse, summary="Check chatbot health")
def health_check():
    """
    Check connectivity to Qdrant vector database and Ollama LLM.
    """
    status = check_health()
    return HealthResponse(**status)


@router.post("/futuristic-careers", response_model=FuturisticCareerResponse, summary="Generate Futuristic Career Suggestions")
def generate_futuristic_careers_endpoint(request: FuturisticCareerRequest):
    """
    🚀 **Futuristic Career Generator**
    
    Generate AI-powered suggestions for emerging and futuristic careers 
    that will be in demand in the next 5-20 years.
    """
    from app.services.futuristic_career_generator import (
        generate_futuristic_careers,
        quick_futuristic_suggestions
    )
    
    # Get structured careers
    result = generate_futuristic_careers(
        interests=request.interests,
        hobbies=request.hobbies or [],
        skills=request.skills or [],
        location=request.location or "India",
        current_field=request.current_field or "",
        num_careers=request.num_careers or 4
    )
    
    # Logic: If structured generation succeeds, use a simple intro text.
    # If it fails, fallback to the text generator.
    if result.get("success") and result.get("careers"):
        # Create a nice summary text
        count = len(result["careers"])
        text_answer = (
            f"Based on your interest in **{request.interests}**, here are {count} emerging career paths "
            f"that will define the future! 🚀\n\n"
            f"These roles focus on innovation, sustainability, and next-gen technology."
        )
        
        return FuturisticCareerResponse(
            success=True,
            careers=result.get("careers", []),
            answer_text=text_answer,
            note="These are emerging careers expected to grow in the next 5-20 years"
        )
    else:
        # Fallback: Generate text if structured data failed
        text_answer = quick_futuristic_suggestions(request.interests, num_suggestions=request.num_careers or 4)
        
        return FuturisticCareerResponse(
            success=False,
            careers=[],
            answer_text=text_answer,
            error=result.get("error", "Unknown error")
        )
