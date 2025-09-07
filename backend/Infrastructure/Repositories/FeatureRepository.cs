using BasarSoftProje.Domain;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace BasarSoftProje.Infrastructure.Repositories
{
    public class FeatureRepository : GenericRepository<Feature>, IFeatureRepository
    {
        public FeatureRepository(AppDbContext ctx) : base(ctx) { }

        public async Task<IReadOnlyList<Feature>> IntersectsAsync(Geometry g)
        {
            return await _ctx.Set<Feature>()
                .AsNoTracking()
                .Where(f => f.Geometry != null && f.Geometry.Intersects(g))
                .ToListAsync();
        }

        public async Task<bool> IntersectsBlockingAsync(Geometry g, int? excludeId = null)
        {
            return await _ctx.Set<Feature>()
                .AsNoTracking()
                .Where(f => f.Type == "B" && f.Geometry != null && f.Geometry.Intersects(g))
                .Where(f => excludeId == null || f.Id != excludeId.Value)
                .AnyAsync();
        }


    }
}
