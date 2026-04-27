from fastapi import FastAPI
from app.routes import chat, summary

app = FastAPI(title="Stress AI Service")

app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(summary.router, prefix="/summary", tags=["Summary"])

@app.get("/")
async def root():
    return {"message": "Welcome to Stress AI Service"}
