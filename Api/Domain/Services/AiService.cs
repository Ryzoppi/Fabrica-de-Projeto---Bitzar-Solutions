using System.Text.Json;
using System.Text.Json.Serialization;

public class AiService
{
    private readonly HttpClient _http;
    private const int MaxTentativas = 3;
    private const int DelayEntreRetry = 2000;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public AiService(HttpClient http)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));
        _http.BaseAddress = new Uri("http://python-api:8000");
    }

    public async Task<object> ChamarLlama(string dadosProcessados, string prompt)
    {
        if (string.IsNullOrWhiteSpace(dadosProcessados))
            throw new ArgumentException("Dados não podem estar vazios", nameof(dadosProcessados));

        // Desserializa os dados brutos para repassar como objeto
        var dados = JsonSerializer.Deserialize<JsonElement>(dadosProcessados, JsonOptions);

        var payload = new
        {
            dados = dados,
            tipo_grafico = ExtrairTipoGrafico(prompt)
        };

        for (int tentativa = 1; tentativa <= MaxTentativas; tentativa++)
        {
            try
            {
                Console.WriteLine($"Tentativa {tentativa}/{MaxTentativas}...");

                var response = await _http.PostAsJsonAsync("/chat", payload, JsonOptions);
                response.EnsureSuccessStatusCode();

                var chartData = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);

                Console.WriteLine("✅ JSON recebido com sucesso!");
                return ConstruirResposta(chartData);
            }
            catch (HttpRequestException ex)
            {
                await TratarErro("Erro de conexão com PythonApi", ex.Message, tentativa);
            }
            catch (JsonException ex)
            {
                await TratarErro("JSON inválido", ex.Message, tentativa);
            }
            catch (Exception ex)
            {
                await TratarErro("Erro inesperado", ex.Message, tentativa);
            }
        }

        return ConstruirRespostaFalha();
    }

    // Extrai tipo de gráfico do prompt se mencionado, senão deixa "auto"
    private static string ExtrairTipoGrafico(string prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt)) return "auto";

        var lower = prompt.ToLower();
        if (lower.Contains("linha") || lower.Contains("line"))  return "line";
        if (lower.Contains("barra") || lower.Contains("bar"))   return "bar";
        if (lower.Contains("pizza") || lower.Contains("pie"))   return "pie";
        if (lower.Contains("area"))                             return "area";

        return "auto";
    }

    private async Task TratarErro(string tipo, string mensagem, int tentativa)
    {
        Console.WriteLine($"⚠️ {tipo} (tentativa {tentativa}): {mensagem}");
        if (tentativa < MaxTentativas)
            await Task.Delay(DelayEntreRetry);
    }

    private static object ConstruirResposta(JsonElement chartData) => new
    {
        data = new
        {
            type   = "charts",
            role   = "ai",
            charts = chartData.TryGetProperty("charts", out var charts)
                ? charts
                : (object)Array.Empty<object>(),
            message = chartData.TryGetProperty("title", out var title)
                ? title.GetString() ?? "Análise concluída"
                : "Análise concluída"
        }
    };

    private static object ConstruirRespostaFalha() => new
    {
        data = new
        {
            role    = "ai",
            charts  = Array.Empty<object>(),
            message = $"Falha após {MaxTentativas} tentativas"
        }
    };
}