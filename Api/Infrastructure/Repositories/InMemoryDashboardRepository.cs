using Api.Domain.Dashboard.Entities;
using Api.Domain.Dashboard.ValueObjects;
using Api.Domain.Dashboard.Repositories;

namespace Api.Infrastructure.Repositories
{
    public class InMemoryDashboardRepository : IDashboardRepository
    {
        private readonly List<Api.Domain.Dashboard.Entities.Dashboard> _dashboards = new();

        public Task<Api.Domain.Dashboard.Entities.Dashboard?> GetByIdAsync(DashboardId id)
        {
            var dashboard = _dashboards.FirstOrDefault(d => d.Id.Equals(id));
            return Task.FromResult(dashboard);
        }

        public Task<IEnumerable<Api.Domain.Dashboard.Entities.Dashboard>> GetAllAsync()
        {
            return Task.FromResult(_dashboards.AsEnumerable());
        }

        public Task<Api.Domain.Dashboard.Entities.Dashboard> AddAsync(Api.Domain.Dashboard.Entities.Dashboard dashboard)
        {
            if (dashboard == null)
                throw new ArgumentNullException(nameof(dashboard));

            if (_dashboards.Any(d => d.Id.Equals(dashboard.Id)))
                throw new InvalidOperationException("Dashboard com este ID já existe");

            _dashboards.Add(dashboard);
            return Task.FromResult(dashboard);
        }

        public Task<Api.Domain.Dashboard.Entities.Dashboard> UpdateAsync(Api.Domain.Dashboard.Entities.Dashboard dashboard)
        {
            if (dashboard == null)
                throw new ArgumentNullException(nameof(dashboard));

            var existingDashboard = _dashboards.FirstOrDefault(d => d.Id.Equals(dashboard.Id));
            if (existingDashboard == null)
                throw new InvalidOperationException("Dashboard não encontrado");

            _dashboards.Remove(existingDashboard);
            _dashboards.Add(dashboard);
            return Task.FromResult(dashboard);
        }

        public Task DeleteAsync(DashboardId id)
        {
            var dashboard = _dashboards.FirstOrDefault(d => d.Id.Equals(id));
            if (dashboard != null)
                _dashboards.Remove(dashboard);

            return Task.CompletedTask;
        }
    }
}
