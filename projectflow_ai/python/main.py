import os
import json
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ─── CONFIGURAÇÃO KIMI (MOONSHOT AI) ───
# A API do Kimi é 100% compatível com OpenAI.
# Basta trocar a base_url e usar sua MOONSHOT_API_KEY.
client = OpenAI(
    api_key=os.getenv("MOONSHOT_API_KEY"),
    base_url="https://api.moonshot.ai/v1",
)
MODEL = os.getenv("KIMI_MODEL", "kimi-k2.6")

# Cache simples em memória
cache = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    cache.clear()

app = FastAPI(
    title="ProjectFlow AI — Kimi Orchestrator",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MODELOS ───
class DemandAnalysisRequest(BaseModel):
    title: str
    description: str
    department: str

class DemandAnalysisResponse(BaseModel):
    type: str
    complexity_score: int
    estimated_hours: int
    estimated_cost: float
    justification: str

# ─── HELPERS ───
def extract_json(text: str) -> dict:
    """Extrai JSON da resposta do Kimi de forma robusta."""
    # Tenta bloco markdown
    match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    # Tenta JSON cru
    match = re.search(r'(\{.*?\})', text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    raise ValueError("JSON não encontrado na resposta do modelo")

# ─── ENDPOINTS ───
@app.post("/api/v1/ai/analyze-demand", response_model=DemandAnalysisResponse)
async def analyze_demand(data: DemandAnalysisRequest):
    cache_key = hash(f"{data.title}:{data.description}:{data.department}")
    if cache_key in cache:
        return DemandAnalysisResponse(**cache[cache_key])

    system_prompt = """Você é o agente de governança do ProjectFlow AI. Analise a demanda corporativa e retorne estritamente um JSON válido."""

    user_prompt = f"""Analise a seguinte demanda corporativa:

Título: {data.title}
Setor: {data.department}
Descrição: {data.description}

Retorne uma resposta estritamente no seguinte formato JSON (sem markdown de bloco de código):
{{
  "type": "Projeto" ou "Ideia",
  "complexity_score": valor inteiro de 1 a 100,
  "estimated_hours": valor inteiro estimado de horas,
  "estimated_cost": valor numérico estimado em reais,
  "justification": "Breve justificativa técnica da análise em português"
}}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1024
        )

        result = extract_json(response.choices[0].message.content)
        cache[cache_key] = result
        return result

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Resposta da IA não é JSON válido: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro na API Kimi: {str(e)}")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "projectflow-ai",
        "provider": "kimi-moonshot",
        "model": MODEL,
        "cache_size": len(cache)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)