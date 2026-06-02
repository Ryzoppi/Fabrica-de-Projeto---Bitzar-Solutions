using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using System.Text.Json;

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
    public async Task<IActionResult> Processar(
      [FromForm] List<IFormFile> arquivos,
      [FromForm] string prompt,
      [FromForm] string? history
    ) {
      try {
        if (arquivos == null || arquivos.Count == 0) return BadRequest(new { erro = "Arquivo não fornecido" });

        if (string.IsNullOrEmpty(prompt)) return BadRequest(new { erro = "Prompt não fornecido" });

        // Processa todos os arquivos (ou só o primeiro)
        var resultadoPython = await _pythonService.ProcessarExcelAsync(arquivos[0]);

        var resultado = await _aiService.ChamarLlama(resultadoPython, prompt, history);
        return Ok(resultado);
      } catch (HttpRequestException ex) {
          return StatusCode(503, new { erro = "Serviço Python indisponível", detalhes = ex.Message });
      } catch (Exception ex) {
          return StatusCode(500, new { erro = "Erro ao processar", detalhes = ex.Message });
      }
    }
}