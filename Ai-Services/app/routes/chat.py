from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.graph_service import process_chat

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    result = await process_chat(request.text)
    return result
