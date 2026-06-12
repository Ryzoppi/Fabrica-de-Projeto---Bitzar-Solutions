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

    return f"""DADOS:
{json.dumps(dados, ensure_ascii=False, indent=None)}

TAREFA: Gere entre 1 e 5 gráficos ApexCharts cruzando dimensões dos dados.
TIPO SOLICITADO: {tipo_grafico}

REGRAS:
- Use valores ABSOLUTOS das colunas. Nunca calcule diferenças, margens ou variações entre métricas
- Nunca invente dados. Use apenas os valores presentes nos dados recebidos
- Nunca gere valores negativos, exceto se já existirem nos dados
- Agrupamento: some registros do mesmo grupo. Nunca use média
- EIXO X (categories): sempre agrupamentos (datas, regiões, categorias). Nunca nomes de métricas
- Séries com nomes descritivos (ex: "Receita", "Custo"). Nunca "series-1", "series-2"
- Evolução temporal: só gere se houver pelo menos 2 datas distintas
- Sem gráficos duplicados (mesma métrica + mesma dimensão = duplicata)
{foco}""".strip()
