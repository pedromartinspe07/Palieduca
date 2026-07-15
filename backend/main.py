import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

SYSTEM_PROMPT = {
    "role": "system",
    "content": "Você é um assistente virtual especialista em Enfermagem e Cuidados Paliativos. Seu tom deve ser sempre acolhedor, empático, profissional e pautado na ética de enfermagem. Suas respostas devem focar no alívio do sofrimento, controle de sintomas (dor, dispneia, etc.) e apoio psicológico ao paciente e à família. Se o usuário perguntar sobre tópicos fora da área da saúde ou cuidados paliativos, redirecione educadamente a conversa de volta para o seu propósito principal. Não prescreva medicamentos, apenas discuta manejos baseados em evidências."
}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY não configurada no servidor backend.")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {groq_api_key}"
    }

    # Prepends the system prompt to the conversation history incoming from frontend
    ai_messages = [SYSTEM_PROMPT] + [msg.model_dump() for msg in request.messages]

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": ai_messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content")
            if not reply:
                raise ValueError("Resposta inválida da API do Groq.")
            return {"reply": reply}

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
