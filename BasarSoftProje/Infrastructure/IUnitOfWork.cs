using BasarSoftProje.Infrastructure.Repositories;

namespace BasarSoftProje.Infrastructure
{
    public interface IUnitOfWork : IDisposable
    {
        IFeatureRepository Features { get; }
        Task<int> SaveChangesAsync();
    }
}
