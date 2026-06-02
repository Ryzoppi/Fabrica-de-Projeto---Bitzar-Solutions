import json
import ollama
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from rag.prompt_builder import construir_prompt
from utils.filtro import extrair_filtro_e_aplicar

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
    history_raw = [{"role": m.role, "content": m.content} for m in req.history]

    dados_filtrados = extrair_filtro_e_aplicar(req.dados, req.prompt, history_raw)

    prompt = construir_prompt(
        dados_filtrados, req.tipo_grafico, req.prompt, history_raw
    )

    messages = history_raw
    messages.append({"role": "user", "content": prompt})

    try:
        client = ollama.Client(host="http://ollama:11434", timeout=170)

        response = client.chat(
            model="bitzar-rag",
            format=APEX_SCHEMA,
            options={
                "temperature": 0,
                "num_predict": 2048,
                "num_ctx": 8192,
            },
            messages=messages,
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
