using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

public class AiService
{
    private readonly HttpClient _http;
    private const int MaxTentativas = 3;
    private const int DelayEntreRetry = 2000; // ms
    private const string OllamaEndpoint = "/api/generate";
    private const string ModeloDefault = "llama3.2:1b";
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AiService(HttpClient http)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));
        _http.BaseAddress = new Uri("http://ollama:11434");
    }

    public async Task<object> ChamarLlama(string dadosProcessados, string prompt)
    {
        if (string.IsNullOrWhiteSpace(dadosProcessados))
            throw new ArgumentException("Dados processados não podem estar vazios", nameof(dadosProcessados));
        if (string.IsNullOrWhiteSpace(prompt))
            throw new ArgumentException("Prompt não pode estar vazio", nameof(prompt));

        var promptCompleto = ConstruirPrompt(dadosProcessados, prompt);

        for (int tentativa = 1; tentativa <= MaxTentativas; tentativa++)
        {
            try
            {
                Console.WriteLine($"Tentativa {tentativa}/{MaxTentativas}...");
                var apexConfig = await ExecutarChamadaLlama(promptCompleto);
                Console.WriteLine("✅ JSON validado com sucesso!");
                return ConstruirResposta(apexConfig);
            }
            catch (JsonException ex)
            {
                await TratarErro("JSON inválido", ex.Message, tentativa);
            }
            catch (HttpRequestException ex)
            {
                await TratarErro("Erro de conexão", ex.Message, tentativa);
            }
            catch (Exception ex)
            {
                await TratarErro("Erro inesperado", ex.Message, tentativa);
            }
        }

        return ConstruirRespostaFalha();
    }

    private string ConstruirPrompt(string dadosProcessados, string prompt) =>
$@"VOCÊ É UM ESPECIALISTA EM VISUALIZAÇÃO DE DADOS COM APEXCHARTS.

🚨 REGRA CRÍTICA: Retorne EXCLUSIVAMENTE um JSON válido, sem markdown, sem ```json, sem explicações.

DADOS RECEBIDOS:
{dadosProcessados}

SOLICITAÇÃO:
{prompt}

PROCESSAMENTO OBRIGATÓRIO:
1. Leia TODOS os registros do campo ""data""
2. AGRUPE por (data, categoria)
3. SOME os valores numéricos por grupo
4. Crie uma série por categoria

IMPORTANTE: 
- NÃO retorne cada linha como um ponto separado
- AGRUPE e SOME os valores
- Use SOMENTE valores reais dos dados

RESPOSTA DEVE TER EXATAMENTE ESTA ESTRUTURA (sem exceções):
{{
  ""data"": {{
    ""charts"": [
      {{
        ""type"": ""line"",
        ""title"": ""Título do Gráfico"",
        ""series"": [
          {{
            ""name"": ""Nome da Série"",
            ""data"": [
              {{""x"": ""2024-01-01"", ""y"": 1000}},
              {{""x"": ""2024-01-05"", ""y"": 1200}}
            ]
          }}
        ],
        ""options"": {{}}
      }}
    ],
    ""message"": ""Descrição resumida da análise""
  }}
}}

VALIDAÇÃO FINAL:
- Chave externa DEVE ser: ""data""
- ""data"" DEVE conter: ""charts"" (ARRAY) e ""message"" (STRING)
- Cada chart DEVE ter: ""type"", ""title"", ""series"", ""options""
- Cada série DEVE ter: ""name"" (STRING) e ""data"" (ARRAY de {{x, y}})
- NÃO criar estrutura duplicada ou aninhada
- NÃO colocar dados em ""data.data.charts""";

    private async Task<object> ExecutarChamadaLlama(string prompt)
    {
        var response = await _http.PostAsJsonAsync(OllamaEndpoint, new
        {
            model = ModeloDefault,
            prompt,
            stream = false
        });

        response.EnsureSuccessStatusCode();
        var jsonString = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(jsonString, JsonOptions);
        var apexConfigStr = result.GetProperty("response").GetString()
            ?? throw new JsonException("Resposta vazia do Llama");

        return ParseJsonResposta(apexConfigStr);
    }

    private static object TransformarDataSample(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Array)
        {
            return JsonSerializer.Deserialize<List<object>>(element.GetRawText(), JsonOptions) 
                  ?? new List<object>();
        }

        if (element.ValueKind == JsonValueKind.Object)
        {
            var rawText = element.GetRawText();
            var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawText, JsonOptions);

            if (dict != null && dict.ContainsKey("data_sample"))
            {
                var dataSample = dict["data_sample"];
                dict.Remove("data_sample");
                dict["data"] = dataSample;
                return dict;
            }
            
            return dict ?? new object();
        }

        return element;
    }

    private async Task TratarErro(string tipo, string mensagem, int tentativa)
    {
        Console.WriteLine($"⚠️ {tipo} (tentativa {tentativa}): {mensagem}");
        if (tentativa < MaxTentativas)
        {
            await Task.Delay(DelayEntreRetry);
        }
    }

    private static object ParseJsonResposta(string jsonString)
    {
        var limpo = LimparJsonString(jsonString);
        limpo = ExtrairPrimeiroJson(limpo);
        var parsed = JsonSerializer.Deserialize<JsonElement>(limpo, JsonOptions);
        
        return NormalizarEstrutura(parsed);
    }

    private static object NormalizarEstrutura(JsonElement parsed)
    {
        Console.WriteLine("🔍 Validando estrutura retornada...");

        if (parsed.ValueKind != JsonValueKind.Object)
            return TransformarDataSample(parsed);

        var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
            parsed.GetRawText(), JsonOptions) ?? new();

        if (dict.ContainsKey("data") && dict["data"].ValueKind == JsonValueKind.Object)
        {
            var dataObj = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                dict["data"].GetRawText(), JsonOptions) ?? new();

            if (dataObj.ContainsKey("charts"))
            {
                Console.WriteLine("✅ Estrutura correta!");
                return TransformarDataSample(parsed);
            }
        }

        var charts = EncontrarCharts(dict);
        if (charts != null)
        {
            Console.WriteLine("⚠️ Estrutura corrigida (aninhamento removido)");
            return new Dictionary<string, object>
            {
                { "data", new Dictionary<string, object>
                    {
                        { "charts", charts },
                        { "message", EncontrarMensagem(dict) ?? "Análise concluída" }
                    }
                }
            };
        }

        Console.WriteLine("⚠️ Estrutura inesperada, retornando como recebido");
        return TransformarDataSample(parsed);
    }

    private static object? EncontrarCharts(Dictionary<string, JsonElement> dict)
    {
        foreach (var kvp in dict)
        {
            if (kvp.Key.Equals("charts", StringComparison.OrdinalIgnoreCase))
            {
                if (kvp.Value.ValueKind == JsonValueKind.Array)
                {
                    return JsonSerializer.Deserialize<List<JsonElement>>(kvp.Value.GetRawText(), JsonOptions);
                }
                else if (kvp.Value.ValueKind == JsonValueKind.Object)
                {
                    var chartsObj = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                        kvp.Value.GetRawText(), JsonOptions) ?? new();
                    if (chartsObj.ContainsKey("data") && chartsObj["data"].ValueKind == JsonValueKind.Array)
                    {
                        return JsonSerializer.Deserialize<List<JsonElement>>(
                            chartsObj["data"].GetRawText(), JsonOptions);
                    }
                }
            }

            if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                var subDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                    kvp.Value.GetRawText(), JsonOptions);
                if (subDict != null)
                {
                    var resultado = EncontrarCharts(subDict);
                    if (resultado != null)
                        return resultado;
                }
            }
        }

        return null;
    }

    private static string? EncontrarMensagem(Dictionary<string, JsonElement> dict)
    {
        foreach (var kvp in dict)
        {
            if (kvp.Key.Equals("message", StringComparison.OrdinalIgnoreCase))
            {
                return kvp.Value.GetString();
            }

            if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                var subDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                    kvp.Value.GetRawText(), JsonOptions);
                if (subDict != null)
                {
                    var resultado = EncontrarMensagem(subDict);
                    if (resultado != null)
                        return resultado;
                }
            }
        }

        return null;
    }

    private static string LimparJsonString(string jsonString) =>
        jsonString
            .Replace("```json", "", StringComparison.OrdinalIgnoreCase)
            .Replace("```", "", StringComparison.Ordinal)
            .Trim();

    private static string ExtrairPrimeiroJson(string texto)
    {
        int inicio = -1;
        char abertura = '{';
        char fechamento = '}';

        for (int i = 0; i < texto.Length; i++)
        {
            if (texto[i] == '{' || texto[i] == '[')
            {
                inicio = i;
                abertura = texto[i];
                fechamento = texto[i] == '{' ? '}' : ']';
                break;
            }
        }

        if (inicio == -1)
            throw new JsonException("Nenhum JSON encontrado na resposta do modelo.");

        int profundidade = 0;
        bool dentroDeString = false;
        bool escapando = false;

        for (int i = inicio; i < texto.Length; i++)
        {
            char c = texto[i];

            if (escapando)
            {
                escapando = false;
                continue;
            }

            if (c == '\\' && dentroDeString)
            {
                escapando = true;
                continue;
            }

            if (c == '"')
            {
                dentroDeString = !dentroDeString;
                continue;
            }

            if (dentroDeString) continue;

            if (c == abertura) profundidade++;
            else if (c == fechamento)
            {
                profundidade--;
                if (profundidade == 0)
                    return texto.Substring(inicio, i - inicio + 1);
            }
        }

        throw new JsonException("JSON incompleto na resposta do modelo.");
    }

    private static object ConstruirResposta(object apexConfig)
    {
        if (apexConfig is System.Collections.IEnumerable list && !(apexConfig is string))
        {
            return new
            {
                data = new
                {
                    type = "charts",
                    role = "ai",
                    charts = apexConfig,
                    message = "Gráficos gerados com sucesso."
                }
            };
        }

        if (apexConfig is Dictionary<string, object> dict)
        {
            if (dict.ContainsKey("data"))
                return dict;

            object charts = dict.ContainsKey("charts") ? dict["charts"] : new[] { dict };
            string message = dict.ContainsKey("message") ? dict["message"].ToString() ?? "Análise concluída" : "Análise concluída";

            return new
            {
                data = new
                {
                    type = "charts",
                    role = "ai",
                    charts = charts,
                    message = message
                }
            };
        }

        return new { data = new { role = "ai", charts = new object[] { }, message = "Dados processados" } };
    }

    private static object ConstruirRespostaFalha() => new
    {
        data = new
        {
            role = "ai",
            charts = Array.Empty<object>(),
            message = $"Falha após {MaxTentativas} tentativas"
        }
    };
}