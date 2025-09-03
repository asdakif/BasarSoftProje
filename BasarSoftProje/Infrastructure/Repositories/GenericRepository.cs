using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BasarSoftProje.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _ctx;
        protected readonly DbSet<T> _set;

        public GenericRepository(AppDbContext ctx)
        {
            _ctx = ctx;
            _set = _ctx.Set<T>();
        }

        public async Task<T?> GetByIdAsync(int id) => await _set.FindAsync(id);

        public async Task<IReadOnlyList<T>> GetAllAsync() =>
            await _set.AsNoTracking().ToListAsync();

        public async Task<IReadOnlyList<T>> WhereAsync(Expression<Func<T, bool>> predicate) =>
            await _set.AsNoTracking().Where(predicate).ToListAsync();

        public async Task AddAsync(T entity) => await _set.AddAsync(entity);
        public async Task AddRangeAsync(IEnumerable<T> entities) => await _set.AddRangeAsync(entities);
        public void Update(T entity) => _set.Update(entity);
        public void Remove(T entity) => _set.Remove(entity);
    }
}