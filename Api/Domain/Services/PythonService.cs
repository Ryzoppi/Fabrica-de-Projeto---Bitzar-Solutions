public class PythonService
{
    private readonly HttpClient _http;

    public PythonService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://python-api:8000");
    }

    public async Task<string> ProcessarExcelAsync(IFormFile arquivo)
    {
        using var content = new MultipartFormDataContent();
        using var stream = arquivo.OpenReadStream();
        content.Add(new StreamContent(stream), "file", arquivo.FileName);

        var response = await _http.PostAsync("/preparar", content);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}
