import json
import ollama
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from rag.prompt_builder import construir_prompt

router = APIRouter(tags=["IA"])

APEX_SCHEMA = {
    "type": "object",
    "properties": {
        "charts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "chartType": {
                        "type": "string",
                        "enum": ["bar", "line", "pie", "area"],
                    },
                    "title": {"type": "string"},
                    "categories": {"type": "array", "items": {"type": "string"}},
                    "series": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "data": {"type": "array", "items": {"type": "number"}},
                            },
                            "required": ["name", "data"],
                        },
                    },
                },
                "required": ["chartType", "title", "series", "categories"],
            },
        }
    },
    "required": ["charts"],
}


@router.post("/chat")
async def chat(req: ChatRequest):
    prompt = construir_prompt(req.dados, req.tipo_grafico)

    try:
        client = ollama.Client(host="http://ollama:11434", timeout=170)

        response = client.chat(
            model="bitzar-rag",
            format=APEX_SCHEMA,
            options={
                "temperature": 0,
                "num_predict": 2048,
                "num_ctx": 4096,
            },
            messages=[{"role": "user", "content": prompt}],
        )

        raw = response["message"]["content"]

        chart_data = json.loads(raw)
        return chart_data

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON inválido: {e}")

    except ollama.ResponseError as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {e.error}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")
