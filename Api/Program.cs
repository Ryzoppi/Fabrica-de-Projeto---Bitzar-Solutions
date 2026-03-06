var builder = WebApplication.CreateBuilder(args);

// --- SERVIÇOS ---
// Adiciona o suporte ao OpenAPI e ao Gerador do Swagger
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- PIPELINE (Configuração de execução) ---
// Verifica se está em ambiente de desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();      // Mapeia o novo endpoint nativo do .NET 10
    app.UseSwagger();      // Gera o JSON do Swagger
    app.UseSwaggerUI();    // Ativa a interface visual em /swagger
}

app.UseHttpsRedirection();

// Endpoint de teste para o projeto Bitzar
app.MapGet("/status-projeto", () => new { 
    Projeto = "Fábrica de Projeto - Bitzar Solutions", 
    Status = "API Rodando", 
    Data = DateTime.Now 
})
.WithName("GetStatusProjeto");

app.Run();