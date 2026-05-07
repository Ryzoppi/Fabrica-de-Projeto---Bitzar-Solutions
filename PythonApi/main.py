import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import io

app = FastAPI(
    title="API XLSX",
    description="API para processar arquivos XLSX e extrair dados",
    version="1.0.0"
)

# =============== MODELOS PYDANTIC ===============

class PreparareResponse(BaseModel):
    status: str
    file_name: str
    sheet_name: str
    data_sample: List[Dict[str, Any]]
    chart_type: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "file_name": "dados.xlsx",
                "sheet_name": "Vendas",
                "data_sample": [
                    {"data": "2024-01-01", "categoria": "A", "receita": 1000}
                ],
                "chart_type": "line"
            }
        }

class SaudeResponse(BaseModel):
    status: str
    timestamp: str

# =============== FUNÇÕES ===============

def limpar_dados(dataframe: pd.DataFrame) -> pd.DataFrame:
    # Converter colunas de data
    for col in dataframe.columns:
        if 'data' in col.lower() or 'date' in col.lower():
            dataframe[col] = pd.to_datetime(dataframe[col], errors='coerce')
            dataframe[col] = dataframe[col].dt.strftime("%Y-%m-%d")
    
    # Converter colunas numéricas com valores em formato de moeda
    colunas_numericas = [col for col in dataframe.columns 
                         if any(term in col.lower() for term in 
                                ['receita', 'custo', 'lucro', 'quantidade', 'preco', 'valor', 'venda'])]
    
    for col in colunas_numericas:
        if col in dataframe.columns:
            dataframe[col] = (
                dataframe[col].astype(str)
                .str.replace(r"[R$\s,]", "", regex=True)
                .str.replace(",", ".")
                .pipe(pd.to_numeric, errors='coerce')
            )
    
    # Remover linhas com valores críticos ausentes
    critical_cols = [col for col in dataframe.columns 
                     if col in colunas_numericas or 'data' in col.lower()]
    if critical_cols:
        dataframe = dataframe.dropna(subset=critical_cols, how='all')
    
    # Preencher valores faltantes em colunas categóricas
    categorical_cols = dataframe.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        dataframe[col] = dataframe[col].fillna('Desconhecido')
    
    # Preencher valores faltantes em colunas numéricas com 0
    dataframe[colunas_numericas] = dataframe[colunas_numericas].fillna(0)
    
    return dataframe.reset_index(drop=True)

FALLBACK_APEX_CONFIG = {
    "chart": {"type": "bar"},
    "title": {"text": "Dados Estatísticos"},
    "series": [],
    "xaxis": {"categories": []},
    "colors": ["#1F4E79"]
}

# =============== ROTAS ===============

@app.post(
    "/preparar",
    response_model=PreparareResponse,
    summary="Processa arquivo XLSX",
    description="Recebe um arquivo XLSX, extrai os dados, limpa e retorna uma amostra com tipo de gráfico detectado",
    response_description="Dados processados com sucesso",
    tags=["Processamento"]
)
async def preparar(file: UploadFile = File(..., description="Arquivo XLSX para processar")) -> PreparareResponse:
    """
    Processa um arquivo XLSX e retorna os dados extraídos.
    
    - **file**: Arquivo XLSX a processar
    
    Retorna:
    - **status**: sempre "success" em caso de sucesso
    - **file_name**: nome do arquivo enviado
    - **sheet_name**: nome da aba Excel processada
    - **data_sample**: primeiras 10 linhas dos dados
    - **chart_type**: tipo de gráfico detectado (line, bar)
    """
    try:
        contents = await file.read()
        excel_file = io.BytesIO(contents)
        
        xls = pd.ExcelFile(excel_file)
        sheet_name = xls.sheet_names[0]
        
        dataframe = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        dataframe = limpar_dados(dataframe)
        
        if len(dataframe) == 0:
            raise HTTPException(
                status_code=400,
                detail="Arquivo não contém dados válidos"
            )
        
        data_sample = dataframe.head(10).fillna('').to_dict(orient='records')
        
        return PreparareResponse(
            status='success',
            file_name=file.filename,
            sheet_name=sheet_name,
            data_sample=data_sample
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )

@app.get(
    "/saude",
    response_model=SaudeResponse,
    summary="Verifica saúde da API",
    description="Retorna o status da API e timestamp atual",
    tags=["Status"]
)
async def saude() -> SaudeResponse:
    """
    Verifica se a API está funcionando corretamente.
    
    Retorna:
    - **status**: sempre "ok"
    - **timestamp**: horário atual em ISO format
    """
    return SaudeResponse(
        status='ok',
        timestamp=datetime.now().isoformat()
    )

# =============== ROOT ===============

@app.get(
    "/",
    summary="Raiz da API",
    tags=["Informação"]
)
async def root():
    return {
        "nome": "API XLSX",
        "versao": "1.0.0",
        "descricao": "API para processar arquivos XLSX",
        "endpoints": {
            "docs": "/docs",
            "preparar": "/preparar",
            "saude": "/saude"
        }
    }