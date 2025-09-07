using BasarSoftProje.Domain;
using NetTopologySuite.Geometries;

namespace BasarSoftProje.Infrastructure.Repositories
{
    public interface IFeatureRepository : IGenericRepository<Feature>
    {
        Task<IReadOnlyList<Feature>> IntersectsAsync(Geometry g);
        Task<bool> IntersectsBlockingAsync(Geometry g, int? excludeId = null);
    }
}
