using Api.Application.Dashboard;
using Api.Domain.Dashboard;
using Api.Domain.Dashboard.Repositories;
using Api.Infrastructure.Repositories;
using OfficeOpenXml;

ExcelPackage.License.SetNonCommercialPersonal("Guilherme");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddHttpClient<PythonService>()
    .ConfigureHttpClient(client => client.Timeout = TimeSpan.FromSeconds(180));
builder.Services.AddHttpClient<AiService>()
    .ConfigureHttpClient(client => client.Timeout = TimeSpan.FromSeconds(180));
builder.Services.AddControllers();
builder.WebHost.UseUrls("http://0.0.0.0:5000");
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Registrar serviços DDD
builder.Services.AddScoped<DashboardDomainService>();
builder.Services.AddScoped<IDashboardRepository, InMemoryDashboardRepository>();
builder.Services.AddScoped<DashboardApplicationService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowLocalhost");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();