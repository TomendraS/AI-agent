from fastapi import FastAPI
from pydantic import BaseModel
import requests, os

app = FastAPI()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    provider: str
    model: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    if req.provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        body = {
            "model": req.model or "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": req.message}
            ]
        }
        resp = requests.post(url, headers=headers, json=body)
        return resp.json()

    elif req.provider == "gemini":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{req.model}:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        body = { "contents": [{"parts": [{"text": req.message}]}] }
        resp = requests.post(url, headers=headers, json=body)
        return resp.json()

    else:
        return {"error": "Unsupported provider"}
