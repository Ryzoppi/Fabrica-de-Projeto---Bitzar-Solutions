import sys
import json
import pandas as pd
import requests

# Argumentos do C#
caminho_json = sys.argv[1]
tipo_grafico = sys.argv[2] if len(sys.argv) > 2 else "bar"

# 1. Carregar JSON
with open(caminho_json, "r", encoding="utf-8") as f:
    json_data = json.load(f)

# 2. limpeza e padronizacao de dados
def limpar_dados(json_data: dict) -> pd.DataFrame:
    df = pd.DataFrame(json_data["data"])

    df["data"] = pd.to_datetime(df["data"], errors="coerce")
    df["data"] = df["data"].dt.strftime("%Y-%m-%d")

    colunas_numericas = ["receita", "custo", "lucro", "preco_unitario"]
    for col in colunas_numericas:
        if col in df.columns:
            df[col] = (
                df[col].astype(str)
                .str.replace(r"[R$\s,]", "", regex=True)
                .pipe(pd.to_numeric, errors="coerce")
            )
#tratamento de nulos
    df.dropna(subset=["data", "receita"], inplace=True)
    df[colunas_numericas] = df[colunas_numericas].fillna(0)
    df.fillna({"categoria": "Desconhecido", "regiao": "Desconhecido"}, inplace=True)
    return df

# 3. Resumir para o Llama
def resumir_para_llm(df: pd.DataFrame) -> dict:
    resumo = {}

    resumo["receita_total"] = round(df["receita"].sum(), 2)
    resumo["media_receita"] = round(df["receita"].mean(), 2)
    resumo["periodo"] = {
        "de": df["data"].min().strftime("%Y-%m-%d"),
        "ate": df["data"].max().strftime("%Y-%m-%d")
    }

    if "categoria" in df.columns:
        resumo["por_categoria"] = (
            df.groupby("categoria")["receita"]
            .sum().round(2)
            .sort_values(ascending=False)
            .to_dict()
        )

    df["mes"] = df["data"].dt.to_period("M").astype(str)
    resumo["por_mes"] = (
        df.groupby("mes")["receita"]
        .sum().round(2)
        .to_dict()
    )

    return resumo

#Detectar tipo de gráfico
def detectar_tipo_grafico(df: pd.DataFrame) -> str:
    tem_datas      = "data" in df.columns and pd.api.types.is_datetime64_any_dtype(df["data"])
    tem_categorias = "categoria" in df.columns or "regiao" in df.columns

    if tem_datas:
        return "line"       # ← Datas priorizam gráfico de linha
    elif tem_categorias:
        return "bar"        # ← Categorias priorizam barra
    else:
        return "bar"        # ← Fallback padrão


#Construir prompt do llama
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
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False},
            timeout=30
        )
        raw = response.json()["response"]
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(raw)
    except (json.JSONDecodeError, KeyError, requests.exceptions.Timeout):
        return FALLBACK_APEX_CONFIG  # ← fallback se a IA falhar

df      = limpar_dados(json_data)
tipo_grafico = detectar_tipo_grafico(df)
resumo  = resumir_para_llm(df)
prompt  = construir_prompt_llama(resumo, tipo_grafico)
config  = chamar_llama(prompt)

# Retorna o resultado para o C# via stdout
print(json.dumps(config, ensure_ascii=False))


