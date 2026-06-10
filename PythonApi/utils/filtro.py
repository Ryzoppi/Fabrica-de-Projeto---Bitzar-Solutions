import unicodedata


def normalizar(texto: str) -> str:
    return (
        unicodedata.normalize("NFKD", texto)
        .encode("ascii", "ignore")
        .decode()
        .lower()
        .strip()
    )


def extrair_filtro_e_aplicar(dados: dict, prompt: str, history: list) -> dict:
    sample = dados.get("data_sample", [])
    if not sample:
        return dados

    textos = [prompt] + [m["content"] for m in history if m["role"] == "user"]
    texto_completo = normalizar(" ".join(textos))

    campos_categoricos = [
        campo for campo, valor in sample[0].items() if isinstance(valor, str)
    ]

    filtros = {}
    for campo in campos_categoricos:
        valores_unicos = {normalizar(str(row.get(campo, ""))) for row in sample}
        for valor in valores_unicos:
            if valor and valor in texto_completo:
                filtros[campo] = valor
                break

    if not filtros:
        return dados

    sample_filtrado = [
        row
        for row in sample
        if all(
            normalizar(str(row.get(campo, ""))) == valor
            for campo, valor in filtros.items()
        )
    ]

    if not sample_filtrado:
        return dados

    return {**dados, "data_sample": sample_filtrado}
