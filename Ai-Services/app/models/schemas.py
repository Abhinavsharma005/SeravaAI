from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    emotions: List[str]
    stress_level: int

class LegalRequest(BaseModel):
    query: str
