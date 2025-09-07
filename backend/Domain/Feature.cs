using NetTopologySuite.Geometries;

namespace BasarSoftProje.Domain
{
    public class Feature
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Wkt { get; set; } = default!;
        public Geometry Geometry { get; set; } = null!;
        public string[] Photos { get; set; } = System.Array.Empty<string>();
        public string Type { get; set; } = string.Empty;
    }
}
