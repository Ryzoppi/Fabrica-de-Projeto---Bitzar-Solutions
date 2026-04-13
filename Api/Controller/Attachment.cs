using Microsoft.AspNetCore.Mvc;

namespace Api.Controller
{
    public class UploadController : ControllerBase
    {
        [HttpPost("Files")]
        public async Task<IActionResult> SendFiles(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("Nenhum arquivo enviado.");

            var resultadoProcessamento = new List<string>();

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    using (var stream = formFile.OpenReadStream())
                    {
                        using (var reader = new StreamReader(stream))
                        {
                            var conteudo = await reader.ReadToEndAsync();

                            resultadoProcessamento.Add($"Processado: {formFile.FileName} ({formFile.Length} bytes)");
                        }
                    }
                }
            }

            return Ok(new { 
                mensagem = "Arquivos processados em memória com sucesso!", 
                detalhes = resultadoProcessamento 
            });
        }
    }
}
