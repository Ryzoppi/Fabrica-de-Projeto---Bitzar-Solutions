# 📊 Bitzar Solutions — Dashboard com IA

Plataforma de geração automática de dashboards interativos a partir de arquivos de dados, com análise e explicação dos gráficos gerada por IA local via Ollama.

---

## 🧩 Visão Geral

O usuário envia um arquivo (`.xlsx`) e faz perguntas em linguagem natural. A IA processa os dados, gera gráficos ApexCharts e opcionalmente explica os resultados em texto — tudo rodando localmente, sem dependência de APIs externas.

```
Usuário → Frontend (React)
       → API Orquestradora (C# / ASP.NET)
       → API de IA (Python / FastAPI)
            ├── Modelo de Gráficos: bitzar-rag (Qwen2.5 fine-tuned)
            └── Modelo de Explicação: llama3.2:3b
       ← Gráficos JSON + Explicação em Markdown
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, MUI, ApexCharts, React Hook Form |
| API Orquestradora | C# / ASP.NET Core |
| API de IA | Python / FastAPI |
| Modelos de IA | Ollama (Qwen2.5, llama3.2:3b) |
| Banco de Dados | PostgreSQL + pgvector |
| Infraestrutura | Docker / Docker Compose |

---

## 📁 Estrutura do Projeto

```
.
├── Front-End/          # Interface React
├── Api/                # API orquestradora em C#
├── PythonApi/          # API de IA em FastAPI
│   ├── models/         # Schemas Pydantic
│   ├── rag/            # Prompt builder e RAG
│   ├── routes/         # Endpoints FastAPI
│   ├── utils/          # Filtros e utilitários
│   ├── db/             # Conexão e migrations
│   └── Modelfile       # Definição do modelo Ollama
├── docker-compose.yml
└── docker-compose.gpu.yml
```

---

## 🚀 Como Rodar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- (Opcional) GPU NVIDIA com drivers instalados para aceleração

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/UInfinitu/Fabrica-de-Projeto-Bitzar-Solutions.git
cd Fabrica-de-Projeto-Bitzar-Solutions
```

2. Crie o arquivo `.env` na raiz com as variáveis necessárias:
```env
POSTGRES_DB=bitzar
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/bitzar
OLLAMA_HOST=http://ollama:11434
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin
```

### Subir sem GPU (qualquer máquina)

```bash
docker compose up --build
```

### Subir com GPU NVIDIA

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up --build
```

> Na primeira execução o Ollama irá baixar os modelos automaticamente (~3-5 GB). Aguarde a conclusão antes de usar o sistema.

---

## 🌐 Serviços Disponíveis

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API C# | http://localhost:5000 |
| API Python | http://localhost:8000 |
| pgAdmin | http://localhost:5050 |

---

## 📈 Funcionalidades

- Upload de arquivos `.xlsx` com dados tabulares
- Geração automática de gráficos (bar, line, area, pie, donut)
- Filtro inteligente de dados por linguagem natural
- Explicação em markdown dos gráficos gerados
- Histórico de conversa com contexto
- Suporte a GPU NVIDIA para acelerar inferência

---

## 🔧 Desenvolvimento

Para sincronizar alterações em tempo real sem rebuildar a imagem, use o modo watch:

```bash
docker compose watch
```

As seguintes pastas são sincronizadas automaticamente:

- `./Front-End/src` → container frontend
- `./PythonApi` → container python-api
- `./Api` → rebuild automático ao alterar

---

## 📦 Modelos Ollama Utilizados

| Modelo | Função |
|---|---|
| `bitzar-rag` | Geração de gráficos em JSON (fine-tune do Qwen2.5) |
| `llama3.2:3b` | Explicação dos gráficos em texto |
| `nomic-embed-text` | Embeddings para o sistema RAG |

