from collections import defaultdict
from typing import Any


def sumarizar_dados(dados: dict, max_linhas: int = 30) -> dict:
    sample = dados.get("data_sample", [])
    if not sample or len(sample) <= max_linhas:
        return dados

    primeira = sample[0]
    numericos = [k for k, v in primeira.items() if isinstance(v, (int, float))]
    categoricos = [k for k, v in primeira.items() if isinstance(v, str)]

    if not categoricos or not numericos:
        return {**dados, "data_sample": sample[:max_linhas]}

    grupos: dict[tuple, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for row in sample:
        chave = tuple(str(row.get(c, "")) for c in categoricos)
        for n in numericos:
            try:
                grupos[chave][n] += float(row.get(n) or 0)
            except (TypeError, ValueError):
                pass

    agregado = []
    for chave, metricas in grupos.items():
        linha: dict[str, Any] = {c: chave[i] for i, c in enumerate(categoricos)}
        linha.update(metricas)
        agregado.append(linha)

    return {**dados, "data_sample": agregado[:max_linhas]}
