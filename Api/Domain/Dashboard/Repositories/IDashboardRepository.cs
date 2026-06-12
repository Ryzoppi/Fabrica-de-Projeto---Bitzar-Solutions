using Api.Domain.Dashboard.Entities;
using Api.Domain.Dashboard.ValueObjects;

namespace Api.Domain.Dashboard.Repositories
{
    public interface IDashboardRepository
    {
        Task<Api.Domain.Dashboard.Entities.Dashboard?> GetByIdAsync(DashboardId id);
        Task<IEnumerable<Api.Domain.Dashboard.Entities.Dashboard>> GetAllAsync();
        Task<Api.Domain.Dashboard.Entities.Dashboard> AddAsync(Api.Domain.Dashboard.Entities.Dashboard dashboard);
        Task<Api.Domain.Dashboard.Entities.Dashboard> UpdateAsync(Api.Domain.Dashboard.Entities.Dashboard dashboard);
        Task DeleteAsync(DashboardId id);
    }
}
