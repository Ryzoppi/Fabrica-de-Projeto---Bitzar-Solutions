import json
from rag.retriever import buscar_chunks


def construir_prompt(dados: dict, tipo_grafico: str = "auto") -> str:
    query_rag = f"definições e regras de negócio para gráfico {tipo_grafico}"
    contextos = buscar_chunks(query_rag, top_k=3)
    contexto_str = (
        "\n\n".join(contextos) if contextos else "Nenhum contexto adicional disponível."
    )

    return f"""
CONTEXTO DE NEGÓCIO:
{contexto_str}

DADOS RECEBIDOS:
{json.dumps(dados, ensure_ascii=False, indent=2)}

TAREFA:
Analise os dados e retorne MÚLTIPLOS gráficos ApexCharts que cruzem diferentes dimensões dos dados.

INSTRUÇÕES DE ANÁLISE:
1. Identifique todas as dimensões categóricas (ex: categoria, regiao, data)
2. Identifique todas as métricas numéricas (ex: receita, custo, quantidade, preco_unitario)
3. Gere entre 3 e 5 gráficos, cada um com um ângulo analítico diferente:
   - Evolução temporal: métricas ao longo do tempo (use "line" ou "area")
   - Comparação por categoria: agrupe por categoria (use "bar")
   - Comparação por região: agrupe por regiao (use "bar" ou "pie")
   - Lucratividade: cruze receita vs custo (use "bar" agrupado ou "line")
   - Ranking ou proporção: participação de cada grupo no total (use "pie")
4. Para cada gráfico:
   - Use um "title" descritivo que explique o que está sendo comparado (ex: "Receita por Categoria", "Evolução de Vendas por Mês")
   - Escolha o "chartType" mais adequado para aquele cruzamento
   - As "categories" devem ser os valores do eixo X
   - Cada "series" representa uma métrica ou dimensão diferente
5. Se tipo_grafico não for "auto", inclua pelo menos um gráfico desse tipo
6. Não invente dados — use apenas os valores presentes nos dados recebidos
7. Agregue (some ou calcule média) quando houver múltiplos registros para o mesmo grupo

EXEMPLO de cruzamento esperado:
- Gráfico 1: Receita total por Categoria (bar)
- Gráfico 2: Receita vs Custo por Região (bar agrupado com 2 series)
- Gráfico 3: Evolução da Receita ao longo das datas (line ou area)
- Gráfico 4: Participação de cada Categoria na Receita total (pie)
- Gráfico 5: Quantidade vendida por Região (bar)

Retorne apenas o JSON, sem texto adicional.
""".strip()
