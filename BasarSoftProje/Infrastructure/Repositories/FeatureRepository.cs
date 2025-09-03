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
            // Generic T yerine doğrudan Feature DbSet'i kullanıyoruz
            return await _ctx.Set<Feature>()
                .AsNoTracking()
                .Where(f => f.Geometry != null && f.Geometry.Intersects(g))
                .ToListAsync();
        }


    }
}
