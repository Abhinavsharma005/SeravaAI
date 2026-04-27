import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def get_gemini_response(prompt: str) -> str:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text
