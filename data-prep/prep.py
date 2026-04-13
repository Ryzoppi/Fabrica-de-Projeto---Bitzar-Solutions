import json
import pandas as pd

def validarJson(json_data: dict) -> pd.DataFrame:
    df = pd.DataFrame(json_data["data"]) #ajustar de acordo com a API C#
    
    # reforçar colunas esperadas
    colunas_esperadas = ["data", "receita", "categoria", "região"]
    faltando = [c for c in colunas_esperadas if c not in df.columns]
    if faltando:
        raise ValueError(f"Missing columns: {faltando}")
    
    return df

def resumoParaLLM(df: pd.DataFrame) -> dict:
    resumo = {}

    # Overall stats
    resumo["receita_total"] = round(df["receita"].sum(), 2)
    resumo["receita_media"]   = round(df["receita"].mean(), 2)
    resumo["período"]    = {
        "De": df["date"].min().strftime("%Y-%m-%d"),
        "até":   df["date"].max().strftime("%Y-%m-%d")
    }

    # 
    if "categoria" in df.columns:
        resumo["receita_por_categoria"] = (
            df.groupby("categoria")["receita"]
            .sum().round(2)
            .sort_values(ascending=False)
            .to_dict()
        )

    # Receita por mes
    df["mês"] = df["data"].dt.to_period("M").astype(str)
    resumo["receita_por_mês"] = (
        df.groupby("mês")["receita"]
        .sum().round(2)
        .to_dict()
    )

    #Top 5 vendas
    resumo["top_5"] = (
        df.nlargest(5, "receita")[["data", "receita", "categoria"]]
        .assign(date=lambda x: x["data"].dt.strftime("%Y-%m-%d"))
        .to_dict(orient="recordes")
    )

    return resumo


def construir_prompt_llama(resumo: dict, tipo_grafico: str = "bar") -> str:
    return f"""
Você é um especialista em visualização de dados. Com base no resumo de vendas abaixo,
gere um objeto JSON de configuração válido para o ApexCharts.

Regras:
- Retorne APENAS um objeto JSON válido. Sem explicações, sem markdown, sem backticks.
- Use o tipo de gráfico: {tipo_grafico}
- Use os dados como estão, não invente novos valores
- Inclua: series, xaxis, yaxis, title, tooltip, colors

Resumo dos Dados:
{json.dumps(resumo, indent=2)}

Configuração ApexCharts:
"""