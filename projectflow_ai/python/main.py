import os
import json
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Configuração Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Cache simples em memória (substituir por Redis em produção)
cache = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    cache.clear()

app = FastAPI(
    title="ProjectFlow AI — Gemini Orchestrator",
    version="1.1.0",
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
    """Extrai JSON da resposta do Gemini de forma robusta."""
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
    # Cache por hash do conteúdo
    cache_key = hash(f"{data.title}:{data.description}:{data.department}")
    if cache_key in cache:
        return DemandAnalysisResponse(**cache[cache_key])

    prompt = f"""
Você é o agente de governança do ProjectFlow AI. Analise a seguinte demanda corporativa:
Título: {data.title}
Setor: {data.department}
Descrição: {data.description}

Retorne uma resposta estritamente no seguinte formato JSON (sem markdown de bloco de código):
{{
  "type": "Projeto" ou "Ideia",
  "complexity_score": valor inteiro de 1 a 100,
  "estimated_hours": valor inteiro estimado de horas,
  "estimated_cost": valor numérico estimado em reais,
  "justification": "Breve justificativa técnica da análise"
}}
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )

        result = extract_json(response.text)
        cache[cache_key] = result
        return result

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Resposta da IA não é JSON válido: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro na API Gemini: {str(e)}")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "projectflow-ai",
        "model": MODEL,
        "cache_size": len(cache)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)