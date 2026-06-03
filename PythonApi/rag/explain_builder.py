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
        charts_resumo.append(
            {
                "tipo": TIPO_GRAFICO_PT.get(tipo_original, tipo_original),
                "titulo": chart.get("title"),
                "categorias": chart.get("categories"),
                "series": chart.get("series"),
            }
        )

    return f"""Você é um analista de dados. O usuário pediu: "{prompt_original}"

Foram gerados os seguintes gráficos com os dados abaixo:
{json.dumps(charts_resumo, ensure_ascii=False, indent=2)}

REGRAS OBRIGATÓRIAS:
- Descreva APENAS o que está explicitamente presente nos dados JSON acima
- NUNCA mencione informações que não aparecem nos dados (ex: "custo", "produção", "lucro") a menos que existam como campo nas series
- NUNCA faça inferências, suposições ou generalizações além dos números fornecidos
- Se um gráfico tiver series com nomes genéricos como "series-2", descreva-o como dado incompleto
- Compare valores REAIS dos dados ao descrever padrões (ex: "Eletrônicos teve receita de 15000 no Sul")

Para cada gráfico, descreva:
1. O que o gráfico representa (tipo e dimensões dos eixos)
2. Os valores mais altos e mais baixos observados
3. Diferenças notáveis entre as categorias ou séries, usando os números reais

Responda em português, usando markdown com títulos (##) e listas."""
