using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries;
namespace BasarSoftProje
{
    public class FeatureReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Wkt { get; set; } = default!;
        public Geometry Geometry { get; set; } = default!;
        public string[] Photos { get; set; } = System.Array.Empty<string>();
        public string Type { get; set; } = "";
    }
}