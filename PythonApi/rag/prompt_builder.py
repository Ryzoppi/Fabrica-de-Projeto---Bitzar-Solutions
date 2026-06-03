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
3. Gere entre 1 e 5 gráficos de acordo com a riqueza dos dados disponíveis:
   - Se os dados forem escassos (poucos registros ou dimensões), gere menos gráficos mais precisos
   - Não force gráficos se não houver dados suficientes para um cruzamento significativo
   - Evolução temporal: métricas ao longo do tempo (use "line" ou "area")
   - Comparação por categoria: agrupe por categoria (use "bar")
   - Comparação por região: agrupe por regiao (use "bar" ou "pie")
   - Lucratividade: cruze receita vs custo (use "bar" agrupado ou "line")
   - Ranking ou proporção: participação de cada grupo no total (use "pie" ou "donut")
4. Para cada gráfico:
   - Use um "title" descritivo que explique o que está sendo comparado
   - Escolha o "chartType" mais adequado para aquele cruzamento
   - As "categories" devem ser os valores do eixo X
   - Cada "series" representa uma métrica ou dimensão diferente
5. Se tipo_grafico não for "auto", inclua pelo menos um gráfico desse tipo
6. Não invente dados — use apenas os valores presentes nos dados recebidos
7. Agregue SEMPRE por SOMA quando houver múltiplos registros para o mesmo grupo (ex: receita total por região = soma de todas as receitas daquela região). NUNCA use média, a menos que o prompt do usuário peça explicitamente.
8. Cada série deve ter nome descritivo (ex: 'Receita', 'Custo') — NUNCA use 'series-1', 'series-2'
9. Cada gráfico DEVE mostrar uma combinação única de (métrica, dimensão, tipo). PROIBIDO repetir o mesmo par — por exemplo, se já gerou "Receita por Região" como bar, NÃO gere novamente como pie com os mesmos dados. Verifique cada gráfico antes de adicionar.
10. Eixo X deve conter agrupamentos (datas, regiões, categorias) — NUNCA nomes de métricas
11. Evolução temporal só é válida se houver pelo menos 2 datas distintas nos dados
12. Antes de retornar, revise os gráficos gerados e remova qualquer duplicata. Dois gráficos são duplicatas se mostram a mesma métrica na mesma dimensão, mesmo que o chartType seja diferente.

EXEMPLO de cruzamento esperado:
- Gráfico 1: Receita total por Categoria (bar)
- Gráfico 2: Receita vs Custo por Região (bar agrupado com 2 series)
- Gráfico 3: Evolução da Receita ao longo das datas (line ou area)
- Gráfico 4: Participação de cada Categoria na Receita total (pie)
- Gráfico 5: Quantidade vendida por Região (bar)
{foco}
Retorne apenas o JSON, sem texto adicional.
""".strip()
