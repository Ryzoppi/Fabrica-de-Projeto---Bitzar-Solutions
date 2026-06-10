from datetime import datetime
from fastapi import FastAPI
from models.schemas import SaudeResponse
from routers import chat, ingest, preparar

app = FastAPI(
    title="Bitzar RAG API",
    description="API para processamento de dados e geração de gráficos com IA",
    version="2.0.0",
)

app.include_router(preparar.router)
app.include_router(chat.router)
app.include_router(ingest.router)


@app.get("/saude", response_model=SaudeResponse, tags=["Status"])
async def saude() -> SaudeResponse:
    return SaudeResponse(status="ok", timestamp=datetime.now().isoformat())


@app.get("/", tags=["Informação"])
async def root():
    return {
        "nome": "RAG API",
        "endpoints": {
            "docs": "/docs",
            "preparar": "/preparar",
            "chat": "/chat",
            "ingest": "/ingest",
            "saude": "/saude",
        },
    }
