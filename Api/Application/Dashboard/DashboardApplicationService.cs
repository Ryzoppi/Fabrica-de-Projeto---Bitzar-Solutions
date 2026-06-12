using Api.Application.Dashboard.DTOs;
using Api.Domain.Dashboard;
using Api.Domain.Dashboard.Entities;
using Api.Domain.Dashboard.ValueObjects;
using Api.Domain.Dashboard.Repositories;

namespace Api.Application.Dashboard
{
    public class DashboardApplicationService
    {
        private readonly IDashboardRepository _repository;
        private readonly DashboardDomainService _domainService;

        public DashboardApplicationService(IDashboardRepository repository, DashboardDomainService domainService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _domainService = domainService ?? throw new ArgumentNullException(nameof(domainService));
        }

        public async Task<DashboardDTO> CreateDashboardAsync(CreateDashboardRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var dashboard = Domain.Dashboard.Entities.Dashboard.Create(request.Name, request.Description);
            await _repository.AddAsync(dashboard);

            return MapToDashboardDTO(dashboard);
        }

        public async Task<DashboardDTO?> GetDashboardByIdAsync(Guid id)
        {
            var dashboardId = new DashboardId(id);
            var dashboard = await _repository.GetByIdAsync(dashboardId);

            return dashboard == null ? null : MapToDashboardDTO(dashboard);
        }

        public async Task<IEnumerable<DashboardDTO>> GetAllDashboardsAsync()
        {
            var dashboards = await _repository.GetAllAsync();
            return dashboards.Select(MapToDashboardDTO);
        }

        public async Task<DashboardDTO> AddChartToDashboardAsync(CreateChartRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var dashboardId = new DashboardId(request.DashboardId);
            var dashboard = await _repository.GetByIdAsync(dashboardId);

            if (dashboard == null)
                throw new InvalidOperationException($"Dashboard com ID {request.DashboardId} não encontrado");

            var dataPoints = request.DataPoints
                .Select(dp => new DataPoint(dp.Label, dp.Value))
                .ToList();

            var chart = Chart.Create(request.Title, request.Type, dataPoints);
            dashboard.AddChart(chart);

            await _repository.UpdateAsync(dashboard);

            return MapToDashboardDTO(dashboard);
        }

        public async Task<DashboardDTO> RemoveChartFromDashboardAsync(Guid dashboardId, Guid chartId)
        {
            var dashId = new DashboardId(dashboardId);
            var dashboard = await _repository.GetByIdAsync(dashId);

            if (dashboard == null)
                throw new InvalidOperationException($"Dashboard com ID {dashboardId} não encontrado");

            var chartToRemove = new ChartId(chartId);
            dashboard.RemoveChart(chartToRemove);

            await _repository.UpdateAsync(dashboard);

            return MapToDashboardDTO(dashboard);
        }

        public async Task<DashboardDTO> UpdateDashboardNameAsync(Guid dashboardId, string newName)
        {
            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("Nome não pode estar vazio", nameof(newName));

            var dashId = new DashboardId(dashboardId);
            var dashboard = await _repository.GetByIdAsync(dashId);

            if (dashboard == null)
                throw new InvalidOperationException($"Dashboard com ID {dashboardId} não encontrado");

            dashboard.UpdateName(newName);
            await _repository.UpdateAsync(dashboard);

            return MapToDashboardDTO(dashboard);
        }

        public async Task DeleteDashboardAsync(Guid dashboardId)
        {
            var dashId = new DashboardId(dashboardId);
            await _repository.DeleteAsync(dashId);
        }

        private static DashboardDTO MapToDashboardDTO(Domain.Dashboard.Entities.Dashboard dashboard)
        {
            return new DashboardDTO
            {
                Id = dashboard.Id.Value,
                Name = dashboard.Name,
                Description = dashboard.Description,
                CreatedAt = dashboard.CreatedAt,
                UpdatedAt = dashboard.UpdatedAt,
                IsActive = dashboard.IsActive,
                Charts = dashboard.Charts.Select(c => new ChartDTO
                {
                    Id = c.Id.Value,
                    Title = c.Title,
                    Type = c.Type,
                    CreatedAt = c.CreatedAt,
                    DataPoints = c.DataPoints.Select(dp => new DataPointDTO(dp.Label, dp.Value)).ToList()
                }).ToList()
            };
        }
    }
}
