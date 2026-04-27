from fastapi import APIRouter
from app.models.schemas import LegalRequest
from app.services.kanoon_service import get_legal_context

router = APIRouter()

@router.post("/legal")
async def legal_summary(request: LegalRequest):
    context = await get_legal_context(request.query)
    return {"context": context}
