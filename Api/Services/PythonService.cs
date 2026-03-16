using System.Diagnostics;
using System.Text.Json;

public class PythonService
{
    private readonly string _pythonPath  = "python";    
    private readonly string _scriptPath  = "data-prep/main.py";
    private readonly string _tempJson    = "temp_input.json";

    public async Task<string> GerarConfigApexAsync(object dadosJson, string tipoGrafico = "bar")
    {
        // 1. Salva o JSON em arquivo temporário
        var jsonString = JsonSerializer.Serialize(dadosJson);
        await File.WriteAllTextAsync(_tempJson, jsonString);

        // 2. Chama o script Python
        var psi = new ProcessStartInfo
        {
            FileName               = _pythonPath,
            Arguments              = $"{_scriptPath} {_tempJson} {tipoGrafico}",
            RedirectStandardOutput = true,
            RedirectStandardError  = true,
            UseShellExecute        = false,
            CreateNoWindow         = true
        };

        using var process = Process.Start(psi)!;
        var output = await process.StandardOutput.ReadToEndAsync();
        var error  = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
            throw new Exception($"Erro no Python: {error}");

        // 3. Retorna o config do ApexCharts
        return output.Trim();
    }
}