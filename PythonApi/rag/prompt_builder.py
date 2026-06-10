import json
# from rag.retriever import buscar_chunks


def construir_prompt(
    dados: dict, tipo_grafico: str = "auto", prompt: str = "", history: list = []
) -> str:
    ultimo_pedido = ""
    if history:
        usuarios = [m for m in history if m.get("role") == "user"]
        if usuarios:
            ultimo_pedido = usuarios[-1].get("content", "")

    # query_rag = (
    #     f"{prompt} — gráfico {tipo_grafico}"
    #     if prompt.strip()
    #     else f"definições e regras de negócio para gráfico {tipo_grafico}"
    # )

    # contextos = buscar_chunks(query_rag, top_k=3)
    # contexto_str = (
    #     "\n\n".join(contextos) if contextos else "Nenhum contexto adicional disponível."
    # )

    foco = ""
    if prompt.strip():
        contexto_historico = (
            f'Pedido anterior do usuário: "{ultimo_pedido}"\n' if ultimo_pedido else ""
        )
        foco = (
            f"\nRESTRIÇÃO OBRIGATÓRIA:\n"
            f"{contexto_historico}"
            f'O usuário solicitou especificamente: "{prompt.strip()}"\n'
            f"Você DEVE filtrar e exibir apenas os dados relevantes a esta solicitação.\n"
            f"Ignore dimensões não relacionadas. Não gere gráficos genéricos.\n"
        )

    return f"""
DADOS RECEBIDOS:
{json.dumps(dados, ensure_ascii=False, indent=2)}

TAREFA:
Analise os dados e retorne gráficos ApexCharts que cruzem diferentes dimensões dos dados.

INSTRUÇÕES DE ANÁLISE:

1. Identifique todas as dimensões categóricas (ex: categoria, regiao, data)
2. Identifique todas as métricas numéricas (ex: receita, custo, quantidade, preco_unitario)
3. Gere entre 1 e 5 gráficos de acordo com a riqueza dos dados:
   - Se os dados forem escassos, gere menos gráficos mais precisos
   - Não force gráficos se não houver dados suficientes para um cruzamento significativo
   - Evolução temporal: métricas ao longo do tempo → "line" ou "area"
   - Comparação por categoria/região → "bar" ou "pie"
   - Múltiplas métricas lado a lado → "bar" agrupado com várias series
   - Proporção/participação no total → "pie" ou "donut"
4. Se tipo_grafico não for "auto", inclua pelo menos um gráfico desse tipo

REGRAS OBRIGATÓRIAS:

- VALORES ABSOLUTOS: Sempre use os valores originais dos dados. NUNCA calcule diferenças, margens, variações ou qualquer derivação entre métricas, a menos que o usuário peça explicitamente
- NUNCA gere valores negativos, exceto se os dados originais já os contiverem
- AGREGAÇÃO: Sempre some quando houver múltiplos registros para o mesmo grupo. NUNCA use média, exceto se o usuário pedir
- DADOS REAIS: Nunca invente dados. Use apenas os valores presentes nos dados recebidos
- SÉRIES NOMEADAS: Cada série deve ter nome descritivo (ex: "Receita", "Custo"). NUNCA use "series-1", "series-2"
- EIXO X: Deve conter agrupamentos (datas, regiões, categorias). NUNCA nomes de métricas
- UNICIDADE: Cada gráfico deve mostrar uma combinação única de (métrica, dimensão, tipo). Dois gráficos são duplicatas se mostram a mesma métrica na mesma dimensão — remova duplicatas antes de retornar
- EVOLUÇÃO TEMPORAL: Só gere se houver pelo menos 2 datas distintas nos dados
- TÍTULO: Cada gráfico deve ter um "title" descritivo que explique o que está sendo comparado

EXEMPLO DE SAÍDA ESPERADA:

Dados com colunas: categoria, regiao, receita, custo, quantidade, data

- Gráfico 1 — Receita total por Categoria (bar):
  categories: ["Eletrônicos", "Roupas", "Alimentos"]
  series: [{{"name": "Receita", "data": [15000, 8000, 5000]}}]

- Gráfico 2 — Receita vs Custo por Região (bar agrupado):
  categories: ["Sul", "Norte", "Centro"]
  series: [
    {{"name": "Receita", "data": [24300, 19700, 8600]}},
    {{"name": "Custo",   "data": [14000, 11000, 5000]}}
  ]
  ⚠️ Cada série usa os valores ABSOLUTOS da sua coluna. NUNCA subtraia receita de custo.

- Gráfico 3 — Evolução da Receita por Região ao longo do tempo (line):
  categories: ["Jan", "Fev", "Mar"]
  series: [
    {{"name": "Sul",    "data": [8000, 9000, 7300]}},
    {{"name": "Norte",  "data": [6000, 7200, 6500]}},
    {{"name": "Centro", "data": [3000, 2800, 2800]}}
  ]

- Gráfico 4 — Participação de cada Região na Receita total (pie):
  categories: ["Sul", "Norte", "Centro"]
  series: [{{"name": "Receita", "data": [24300, 19700, 8600]}}]

- Gráfico 5 — Quantidade vendida por Categoria (bar):
  categories: ["Eletrônicos", "Roupas", "Alimentos"]
  series: [{{"name": "Quantidade", "data": [320, 210, 180]}}]
{foco}
Retorne apenas o JSON, sem texto adicional, sem markdown, sem explicações.
""".strip()
