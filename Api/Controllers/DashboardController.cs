using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;

[ApiController]
[Route("")]
public class DashboardController : ControllerBase
{
    private readonly PythonService _pythonService;
    private readonly AiService _aiService;

    public DashboardController(PythonService pythonService, AiService aiService)
    {
        _pythonService = pythonService;
        _aiService = aiService;
    }

    [HttpPost("processar")]
    public async Task<IActionResult> Processar(IFormFile arquivo, [FromForm] string prompt)
    {
            Console.WriteLine($"Arquivo: {arquivo?.FileName}"); // ← log aqui
            Console.WriteLine($"Prompt: {prompt}"); 
        try
        {
            if (arquivo == null || arquivo.Length == 0)
                return BadRequest(new { erro = "Arquivo não fornecido" });

            if (string.IsNullOrEmpty(prompt))
                return BadRequest(new { erro = "Prompt não fornecido" });

            var resultadoPython = await _pythonService.ProcessarExcelAsync(arquivo);
            var resultado = await _aiService.ChamarLlama(resultadoPython, prompt);
            return Ok(resultado);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(503, new { erro = "Serviço Python indisponível", detalhes = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { erro = "Erro ao processar", detalhes = ex.Message });
        }
    }
}