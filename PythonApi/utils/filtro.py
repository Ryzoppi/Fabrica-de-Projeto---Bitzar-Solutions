def extrair_filtro_e_aplicar(dados: dict, prompt: str, history: list) -> dict:
    sample = dados.get("data_sample", [])
    if not sample:
        return dados

    textos = [prompt] + [m["content"] for m in history if m["role"] == "user"]
    texto_completo = " ".join(textos).lower()

    campos_categoricos = [
        campo for campo, valor in sample[0].items() if isinstance(valor, str)
    ]

    filtros = {}
    for campo in campos_categoricos:
        valores_unicos = {str(row.get(campo, "")).lower() for row in sample}
        for valor in valores_unicos:
            if valor and valor in texto_completo:
                filtros[campo] = valor
                break  # um filtro por campo

    if not filtros:
        return dados

    sample_filtrado = [
        row
        for row in sample
        if all(
            str(row.get(campo, "")).lower() == valor for campo, valor in filtros.items()
        )
    ]

    if sample_filtrado:
        return {**dados, "data_sample": sample_filtrado}

    return dados
