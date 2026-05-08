using System;
using System.Text.Json;
using System.Threading.Tasks;

public class AiService
{
    private readonly HttpClient _http;
    private const int MaxTentativas = 3;
    
    public AiService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://ollama:11434");
    }

    public async Task<object> ChamarLlama(string dadosProcessados, string prompt)
    {
        var promptCompleto = $@"
Você é um especialista em visualização de dados e ApexCharts.
Retorne EXCLUSIVAMENTE um JSON válido, sem markdown ou explicações.

Dados: {dadosProcessados}
Prompt do usuário: {prompt}

Retorne apenas o JSON válido para ApexCharts:";

        for (int tentativa = 1; tentativa <= MaxTentativas; tentativa++)
        {
            try
            {
                Console.WriteLine($"Tentativa {tentativa}/{MaxTentativas}...");
                
                var response = await _http.PostAsJsonAsync("/api/generate", new
                {
                    model = "llama3.2",
                    prompt = promptCompleto,
                    stream = false
                });

                response.EnsureSuccessStatusCode();
                var jsonString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(jsonString);
                var apexConfigStr = result.GetProperty("response").GetString();
                    if (string.IsNullOrEmpty(apexConfigStr))
                        {
                            throw new JsonException("Resposta vazia do Llama");
                        }

                // Remove markdown se presente
                apexConfigStr = apexConfigStr
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                var apexConfig = JsonSerializer.Deserialize<object>(apexConfigStr);
                Console.WriteLine("✅ JSON validado com sucesso!");

                return new
                {
                    data = new
                    {
                        role = "ai",
                        charts = new[] { apexConfig },
                        message = ""
                    }
                };
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"⚠️ JSON inválido (tentativa {tentativa}): {ex.Message}"); 
                if (tentativa < MaxTentativas)
                {
                    await Task.Delay(2000);
                }
                continue;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"❌ Erro de conexão (tentativa {tentativa}): {ex.Message}");
                if (tentativa < MaxTentativas)
                {
                    await Task.Delay(2000);
                }
                continue;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro inesperado (tentativa {tentativa}): {ex.Message}");
                if (tentativa < MaxTentativas)
                {
                    await Task.Delay(2000);
                }
                continue;
            }
        }

        return new
        {
            data = new
            {
                role = "ai",
                charts = Array.Empty<object>(),
                message = $"Falha após {MaxTentativas} tentativas"
            }
        };
    }
}