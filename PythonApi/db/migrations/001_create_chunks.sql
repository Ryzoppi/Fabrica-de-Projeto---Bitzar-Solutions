-- Habilita extensão de vetores
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de documentos (fonte dos chunks)
CREATE TABLE IF NOT EXISTS documents (
    id          SERIAL PRIMARY KEY,
    titulo      TEXT NOT NULL,
    descricao   TEXT,
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- Tabela de chunks com embedding
CREATE TABLE IF NOT EXISTS chunks (
    id          SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    conteudo    TEXT NOT NULL,
    embedding   vector(768),        -- dimensão do phi3:mini / nomic-embed
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- Índice para busca por similaridade (cosine)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
    ON chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);