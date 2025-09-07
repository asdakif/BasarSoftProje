using BasarSoftProje.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BasarSoftProje.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _ctx;
        public IFeatureRepository Features { get; }

        public UnitOfWork(AppDbContext ctx, IFeatureRepository featureRepository)
        {
            _ctx = ctx;
            Features = featureRepository;
        }

        public Task<int> SaveChangesAsync() => _ctx.SaveChangesAsync();
        public void Dispose() => _ctx.Dispose();
    }
}
