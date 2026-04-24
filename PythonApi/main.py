import json
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Payload(BaseModel):
    data: list
    tipo_grafico: str = "bar"

# 2. Limpeza e padronização de dados
def limpar_dados(json_data: dict) -> pd.DataFrame:
    dataframe = pd.DataFrame(json_data["data"])

    dataframe["data"] = pd.to_datetime(dataframe["data"], errors="coerce")
    dataframe["data"] = dataframe["data"].dt.strftime("%Y-%m-%d")

    colunas_numericas = ["receita", "custo", "lucro", "preco_unitario"]
    for col in colunas_numericas:
        if col in dataframe.columns:
            dataframe[col] = (
                dataframe[col].astype(str)
                .str.replace(r"[R$\s,]", "", regex=True)
                .pipe(pd.to_numeric, errors="coerce")
            )

    # Tratamento de nulos
    dataframe.dropna(subset=["data", "receita"], inplace=True)
    dataframe[colunas_numericas] = dataframe[colunas_numericas].fillna(0)
    dataframe.fillna({"categoria": "Desconhecido", "regiao": "Desconhecido"}, inplace=True)
    return dataframe

# 3. Resumir para o Llama
def resumir_para_llm(dataframe: pd.DataFrame) -> dict:
    resumo = {}
    resumo["receita_total"] = round(dataframe["receita"].sum(), 2)
    resumo["media_receita"] = round(dataframe["receita"].mean(), 2)
    resumo["periodo"] = {
        "de":  dataframe["data"].min(),
        "ate": dataframe["data"].max()
    }
    if "categoria" in dataframe.columns:
        resumo["por_categoria"] = (
            dataframe.groupby("categoria")["receita"]
            .sum().round(2)
            .sort_values(ascending=False)
            .to_dict()
        )
    dataframe["mes"] = pd.to_datetime(dataframe["data"]).dt.to_period("M").astype(str)
    resumo["por_mes"] = (
        dataframe.groupby("mes")["receita"].sum().round(2).to_dict()
    )
    return resumo

# Detectar tipo de gráfico
def detectar_tipo_grafico(dataframe: pd.DataFrame) -> str:
    tem_datas      = "data" in dataframe.columns
    tem_categorias = "categoria" in dataframe.columns or "regiao" in dataframe.columns
    if tem_datas:
        return "line"
    elif tem_categorias:
        return "bar"
    return "bar"

# Construir prompt do Llama
def construir_prompt_llama(resumo: dict, tipo_grafico: str) -> str:
    return f"""
Você é um especialista em visualização de dados. Com base no resumo de vendas abaixo,
gere um objeto JSON de configuração válido para o ApexCharts.

Regras:
- Retorne APENAS um objeto JSON válido. Sem explicações, sem markdown, sem backticks.
- O tipo de gráfico sugerido é: {tipo_grafico}
- Se os dados tiverem datas/períodos, use "line". Se tiverem categorias, use "bar" ou "donut".
- Se não conseguir decidir, use "bar" como padrão.
- Use os dados como estão, não invente novos valores.
- Inclua: series, xaxis, yaxis, title, tooltip, colors

Resumo dos Dados:
{json.dumps(resumo, indent=2, ensure_ascii=False)}

Configuração ApexCharts:
"""

FALLBACK_APEX_CONFIG = {
    "chart":  {"type": "bar"},
    "title":  {"text": "Dados de Vendas"},
    "series": [],
    "xaxis":  {"categories": []},
    "colors": ["#1F4E79"]
}

def chamar_llama(prompt: str) -> dict:
    try:
        response = requests.post(
            "http://ollama:11434/api/generate",  # ← nome do serviço Docker
            json={"model": "llama3", "prompt": prompt, "stream": False},
            timeout=30
        )
        raw = response.json()["response"]
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(raw)
    except (json.JSONDecodeError, KeyError, requests.exceptions.Timeout):
        return FALLBACK_APEX_CONFIG

# ── Rota principal ────────────────────────────────────────────────
@app.post("/preparar")
def preparar(payload: Payload):
    try:
        dataframe    = limpar_dados({"data": payload.data})
        tipo_grafico = detectar_tipo_grafico(dataframe)
        resumo       = resumir_para_llm(dataframe)
        prompt       = construir_prompt_llama(resumo, tipo_grafico)
        config       = chamar_llama(prompt)
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

