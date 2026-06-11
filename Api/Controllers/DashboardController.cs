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
public async Task Processar(
    [FromForm] List<IFormFile> arquivos,
    [FromForm] string prompt,
    [FromForm] string? history)
{

        var bodyFeature = HttpContext.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpResponseBodyFeature>();
    bodyFeature?.DisableBuffering();


    if (arquivos == null || arquivos.Count == 0)
    {
        Response.StatusCode = 400;
        await Response.WriteAsJsonAsync(new { erro = "Arquivo não fornecido" });
        return;
    }

    if (string.IsNullOrEmpty(prompt))
    {
        Response.StatusCode = 400;
        await Response.WriteAsJsonAsync(new { erro = "Prompt não fornecido" });
        return;
    }

    Response.Headers["Content-Type"] = "text/event-stream";
    Response.Headers["Cache-Control"] = "no-cache";
    Response.Headers["Connection"] = "keep-alive";
    Response.Headers["X-Accel-Buffering"] = "no";

    var ct = HttpContext.RequestAborted;

    async Task SendEvent(string type, string message, object? data = null)
    {
        var payload = new { type, message, data };
        var json = System.Text.Json.JsonSerializer.Serialize(payload);
        await Response.WriteAsync($"data: {json}\n\n", ct);
        await Response.Body.FlushAsync(ct);
        Console.WriteLine($"[SSE] {message}");
    }

    try
    {
        await SendEvent("status", "Preparando dados...");
        var resultadoPython = await _pythonService.ProcessarExcelAsync(arquivos[0]);

        await SendEvent("status", "Processando dados e gerando gráficos...");
        var resultado = await _aiService.ChamarLlama(resultadoPython, prompt, history);

        await SendEvent("done", "Concluído!", resultado);
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("[SSE] Cancelado pelo usuário");
    }
    catch (HttpRequestException ex)
    {
        await SendEvent("error", $"Serviço Python indisponível: {ex.Message}");
    }
    catch (Exception ex)
    {
        await SendEvent("error", $"Erro: {ex.Message}");
    }
}
}