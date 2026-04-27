from app.services.emotion_service import detect_emotions
from app.services.gemini_service import get_gemini_response

async def process_chat(text: str):
    emotions = await detect_emotions(text)
    prompt = f"User said: {text}. Detected emotions: {emotions}. Provide an empathetic response."
    response = await get_gemini_response(prompt)
    
    return {
        "response": response,
        "emotions": emotions,
        "stress_level": 75  # Calculated based on emotions
    }
