using Api.Domain.Dashboard.Entities;
using Api.Domain.Dashboard.ValueObjects;

namespace Api.Domain.Dashboard
{
    public class DashboardDomainService
    {
        public void CopyChartsFromDashboard(Api.Domain.Dashboard.Entities.Dashboard sourceDashboard, Api.Domain.Dashboard.Entities.Dashboard targetDashboard)
        {
            if (sourceDashboard == null)
                throw new ArgumentNullException(nameof(sourceDashboard));

            if (targetDashboard == null)
                throw new ArgumentNullException(nameof(targetDashboard));

            if (!sourceDashboard.IsActive)
                throw new InvalidOperationException("Não é possível copiar gráficos de um dashboard inativo");

            foreach (var chart in sourceDashboard.Charts)
            {
                var newChartDataPoints = new List<DataPoint>(chart.DataPoints);
                var newChart = Chart.Create(chart.Title, chart.Type, newChartDataPoints);
                targetDashboard.AddChart(newChart);
            }
        }

        public Api.Domain.Dashboard.Entities.Dashboard MergeDashboards(Api.Domain.Dashboard.Entities.Dashboard dashboard1, Api.Domain.Dashboard.Entities.Dashboard dashboard2)
        {
            if (dashboard1 == null)
                throw new ArgumentNullException(nameof(dashboard1));

            if (dashboard2 == null)
                throw new ArgumentNullException(nameof(dashboard2));

            var mergedDashboard = Api.Domain.Dashboard.Entities.Dashboard.Create(
                $"{dashboard1.Name} + {dashboard2.Name}",
                $"Merged from {dashboard1.Name} and {dashboard2.Name}"
            );

            CopyChartsFromDashboard(dashboard1, mergedDashboard);
            CopyChartsFromDashboard(dashboard2, mergedDashboard);

            return mergedDashboard;
        }

        public bool ValidateChartDataIntegrity(Chart chart)
        {
            if (chart == null)
                return false;

            if (chart.DataPoints == null || chart.DataPoints.Count == 0)
                return false;

            var totalValue = chart.DataPoints.Sum(dp => dp.Value);
            return totalValue >= 0;
        }
    }
}
