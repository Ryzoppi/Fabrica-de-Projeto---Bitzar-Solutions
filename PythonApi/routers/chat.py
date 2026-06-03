import json
import asyncio
import ollama
from fastapi import APIRouter, HTTPException
from concurrent.futures import ThreadPoolExecutor
from models.schemas import ChatRequest
from rag.prompt_builder import construir_prompt
from rag.explain_builder import construir_prompt_explicacao
from utils.filtro import extrair_filtro_e_aplicar

router = APIRouter(tags=["IA"])

EXPLAIN_MODEL = "llama3.2:3b"
_executor = ThreadPoolExecutor(max_workers=2)

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
                        "enum": ["bar", "line", "pie", "area", "donut"],
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


def _chamar_bitzar(client: ollama.Client, messages: list) -> dict:
    response = client.chat(
        model="bitzar-rag",
        format=APEX_SCHEMA,
        options={"temperature": 0, "num_predict": 2048, "num_ctx": 8192},
        messages=messages,
    )
    return json.loads(response["message"]["content"])


def _chamar_explain(
    client: ollama.Client, chart_data: dict, prompt_original: str
) -> str:
    prompt_exp = construir_prompt_explicacao(chart_data, prompt_original)
    response = client.chat(
        model=EXPLAIN_MODEL,
        options={"temperature": 0.3, "num_predict": 1024, "num_ctx": 4096},
        messages=[{"role": "user", "content": prompt_exp}],
    )
    return response["message"]["content"]


def remover_duplicatas(charts: list) -> list:
    vistos = set()
    unicos = []
    for chart in charts:
        chave = (
            chart.get("chartType"),
            chart.get("title", "").lower()[:30],
            tuple(s.get("name", "") for s in chart.get("series", [])),
        )
        if chave not in vistos:
            vistos.add(chave)
            unicos.append(chart)
    return unicos


@router.post("/chat")
async def chat(req: ChatRequest):
    history_raw = [{"role": m.role, "content": m.content} for m in req.history]
    dados_filtrados = extrair_filtro_e_aplicar(req.dados, req.prompt, history_raw)
    prompt = construir_prompt(
        dados_filtrados, req.tipo_grafico, req.prompt, history_raw
    )
    messages = history_raw + [{"role": "user", "content": prompt}]

    try:
        client = ollama.Client(host="http://ollama:11434", timeout=170)
        loop = asyncio.get_event_loop()

        # Modelo 1: gera os gráficos
        chart_data = await loop.run_in_executor(
            _executor, _chamar_bitzar, client, messages
        )

        chart_data["charts"] = remover_duplicatas(chart_data.get("charts", []))

        # Modelo 2: explicação em paralelo só se solicitado
        if req.explain:
            chart_data["explanation"] = await loop.run_in_executor(
                _executor, _chamar_explain, client, chart_data, req.prompt
            )

        return chart_data

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON inválido: {e}")
    except ollama.ResponseError as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {e.error}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")
