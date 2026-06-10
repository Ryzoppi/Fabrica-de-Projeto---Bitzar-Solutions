import ollama
from db.connection import get_connection


def chunk_texto(texto: str, tamanho: int = 300, sobreposicao: int = 50) -> list[str]:
    """Divide texto em chunks com sobreposição."""
    palavras = texto.split()
    chunks = []
    i = 0
    while i < len(palavras):
        chunk = " ".join(palavras[i : i + tamanho])
        chunks.append(chunk)
        i += tamanho - sobreposicao
    return chunks


def gerar_embedding(texto: str) -> list[float]:
    """Gera embedding via Ollama (modelo nomic-embed-text)."""
    resp = ollama.embeddings(model="nomic-embed-text", prompt=texto)
    return resp["embedding"]


def ingerir_documento(titulo: str, conteudo: str, descricao: str = "") -> int:
    """Salva documento e seus chunks com embeddings no banco."""
    chunks = chunk_texto(conteudo)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO documents (titulo, descricao) VALUES (%s, %s) RETURNING id",
                (titulo, descricao),
            )
            document_id = cur.fetchone()["id"]

            for chunk in chunks:
                embedding = gerar_embedding(chunk)
                cur.execute(
                    "INSERT INTO chunks (document_id, conteudo, embedding) VALUES (%s, %s, %s)",
                    (document_id, chunk, embedding),
                )

    return document_id
