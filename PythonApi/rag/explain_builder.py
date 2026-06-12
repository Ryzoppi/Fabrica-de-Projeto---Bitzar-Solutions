import json

TIPO_GRAFICO_PT = {
    "bar": "Barras",
    "line": "Linha",
    "area": "Área",
    "pie": "Pizza",
    "donut": "Rosquinha",
}


def construir_prompt_explicacao(chart_data: dict, prompt_original: str) -> str:
    charts_resumo = []
    for chart in chart_data.get("charts", []):
        tipo_original = chart.get("chartType", "")
        categories = chart.get("categories", [])
        series = chart.get("series", [])

        charts_resumo.append(
            {
                "tipo": TIPO_GRAFICO_PT.get(tipo_original, tipo_original),
                "titulo": chart.get("title"),
                "eixo_x": {
                    "descricao": "Valores do eixo horizontal (categorias/datas/regiões)",
                    "valores": categories,
                },
                "series": [
                    {
                        "nome_da_serie": s.get("name"),
                        "descricao": "Valores numéricos correspondentes a cada item do eixo_x",
                        "dados": s.get("data"),
                    }
                    for s in series
                ],
            }
        )

    return f"""Você é um analista de dados. O usuário pediu: "{prompt_original}"

Foram gerados os seguintes gráficos:
{json.dumps(charts_resumo, ensure_ascii=False, indent=2)}

REGRAS OBRIGATÓRIAS:
- O campo "eixo_x.valores" contém os rótulos do eixo horizontal (ex: datas, regiões, categorias)
- O campo "series[].dados" contém os valores numéricos de cada série para cada item do eixo_x
- Descreva APENAS o que está explicitamente presente nos dados acima
- NUNCA mencione informações que não aparecem nos dados
- Compare valores REAIS ao descrever padrões (ex: "Eletrônicos teve receita de 15000")

Para cada gráfico, descreva:
1. O que o gráfico representa (tipo e o que está em cada eixo)
2. Os valores mais altos e mais baixos observados
3. Diferenças notáveis entre as categorias ou séries, usando os números reais

Responda em português, usando markdown com títulos (##) e listas."""
