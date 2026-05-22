from fastapi import APIRouter, HTTPException
from models.schemas import IngestRequest
from db.ingest import ingerir_documento

router = APIRouter(tags=["RAG"])


@router.post("/ingest")
async def ingest(req: IngestRequest):
    try:
        document_id = ingerir_documento(req.titulo, req.conteudo, req.descricao)
        return {"document_id": document_id, "status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
