from typing import Any, Dict, List
from pydantic import BaseModel
from typing import Literal


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class PreparareResponse(BaseModel):
    status: str
    file_name: str
    sheet_name: str
    data_sample: List[Dict[str, Any]]

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "success",
                "file_name": "dados.xlsx",
                "sheet_name": "Vendas",
                "data_sample": [
                    {"data": "2024-01-01", "categoria": "A", "receita": 1000}
                ],
            }
        }
    }


class SaudeResponse(BaseModel):
    status: str
    timestamp: str


class ChatRequest(BaseModel):
    dados: dict
    tipo_grafico: str = "auto"
    prompt: str = ""
    history: List[HistoryMessage] = []
    explain: bool = False


class IngestRequest(BaseModel):
    titulo: str
    conteudo: str
    descricao: str = ""
