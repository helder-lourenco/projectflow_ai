import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ProjectFlow AI - Gemini Orchestrator")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class DemandAnalysisRequest(BaseModel):
    title: str
    description: str
    department: str

class DemandAnalysisResponse(BaseModel):
    type: str  # "Projeto" ou "Ideia"
    complexity_score: int  # 1 a 100
    estimated_hours: int
    estimated_cost: float
    justification: str

@app.post("/api/v1/ai/analyze-demand", response_model=DemandAnalysisResponse)
async def analyze_demand(data: DemandAnalysisRequest):
    try:
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

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        import json
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean_json)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)