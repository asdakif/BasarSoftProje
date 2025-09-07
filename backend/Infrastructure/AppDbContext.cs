using BasarSoftProje.Domain;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite;
namespace BasarSoftProje.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public DbSet<Feature> Features => Set<Feature>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.HasPostgresExtension("postgis");

            b.Entity<Feature>(e =>
            {
                e.ToTable("features", "public");

                e.HasKey(x => x.Id);

                e.Property(x => x.Id)
                 .HasColumnName("id");

                e.Property(x => x.Name)
                 .IsRequired()
                 .HasMaxLength(200)
                 .HasColumnName("name");

                e.Property(x => x.Wkt)
                 .IsRequired()
                 .HasColumnName("wkt");

                e.Property(x => x.Type)
                 .IsRequired()
                 .HasMaxLength(1)
                 .HasColumnName("Type");

                e.Property(x => x.Photos)
                 .HasColumnName("photos")
                 .HasColumnType("text[]");

               e.Property(x => x.Geometry)
                .HasColumnName("geom")
                .HasColumnType("geometry(Geometry,4326)");          

                e.HasIndex(x => x.Geometry)
                 .HasMethod("GIST")
                 .HasDatabaseName("features_geom_gix");
            });
        }
    }
}
