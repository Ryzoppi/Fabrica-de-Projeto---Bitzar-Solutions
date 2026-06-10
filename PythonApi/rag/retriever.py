from rag.embedder import gerar_embedding
from db.connection import get_connection


def buscar_chunks(query: str, top_k: int = 3) -> list[str]:
    """
    Busca os chunks mais relevantes para a query usando similaridade cosine.
    Retorna lista de textos para compor o contexto do prompt.
    """
    embedding = gerar_embedding(query)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT conteudo
                FROM chunks
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (embedding, top_k),
            )
            rows = cur.fetchall()

    return [row["conteudo"] for row in rows]
