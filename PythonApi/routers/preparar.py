import io
from fastapi import APIRouter, File, HTTPException, UploadFile
from utils.limpeza import limpar_dados
from models.schemas import PreparareResponse

router = APIRouter(tags=["Processamento"])


@router.post(
    "/preparar",
    response_model=PreparareResponse,
    summary="Processa arquivo XLSX",
    description="Recebe um arquivo XLSX, extrai os dados, limpa e retorna uma amostra",
)
async def preparar(
    file: UploadFile = File(..., description="Arquivo XLSX para processar"),
) -> PreparareResponse:
    try:
        contents = await file.read()
        excel_file = io.BytesIO(contents)

        import pandas as pd

        xls = pd.ExcelFile(excel_file)
        sheet_name = xls.sheet_names[0]

        dataframe = pd.read_excel(excel_file, sheet_name=sheet_name)
        dataframe = limpar_dados(dataframe)

        if len(dataframe) == 0:
            raise HTTPException(
                status_code=400, detail="Arquivo não contém dados válidos"
            )

        data_sample = dataframe.head(10).fillna("").to_dict(orient="records")

        return PreparareResponse(
            status="success",
            file_name=file.filename,
            sheet_name=sheet_name,
            data_sample=data_sample,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao processar arquivo: {str(e)}"
        )
