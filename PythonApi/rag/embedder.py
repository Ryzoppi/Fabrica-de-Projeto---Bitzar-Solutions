import ollama


def gerar_embedding(texto: str) -> list[float]:
    """
    Gera embedding via Ollama.
    Usa nomic-embed-text (768 dims) — leve e roda bem em CPU.
    """
    resp = ollama.embeddings(model="nomic-embed-text", prompt=texto)
    return resp["embedding"]
