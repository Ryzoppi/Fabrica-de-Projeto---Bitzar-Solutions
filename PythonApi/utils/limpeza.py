import pandas as pd


def limpar_dados(dataframe: pd.DataFrame) -> pd.DataFrame:
    for col in dataframe.columns:
        if "data" in col.lower() or "date" in col.lower():
            dataframe[col] = pd.to_datetime(dataframe[col], errors="coerce")
            dataframe[col] = dataframe[col].dt.strftime("%Y-%m-%d")

    colunas_numericas = [
        col
        for col in dataframe.columns
        if any(
            term in col.lower()
            for term in [
                "receita",
                "custo",
                "lucro",
                "quantidade",
                "preco",
                "valor",
                "venda",
            ]
        )
    ]

    for col in colunas_numericas:
        if col in dataframe.columns:
            dataframe[col] = (
                dataframe[col]
                .astype(str)
                .str.replace(r"[R$\s,]", "", regex=True)
                .str.replace(",", ".")
                .pipe(pd.to_numeric, errors="coerce")
            )

    critical_cols = [
        col
        for col in dataframe.columns
        if col in colunas_numericas or "data" in col.lower()
    ]
    if critical_cols:
        dataframe = dataframe.dropna(subset=critical_cols, how="all")

    categorical_cols = dataframe.select_dtypes(include=["object"]).columns
    for col in categorical_cols:
        dataframe[col] = dataframe[col].fillna("Desconhecido")

    dataframe[colunas_numericas] = dataframe[colunas_numericas].fillna(0)

    return dataframe.reset_index(drop=True)
