using System.Text.RegularExpressions;

namespace BasarSoftProje
{
    public static class Validators
    {
        static readonly Regex Point = new(@"^\s*POINT\s*\(\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s*\)\s*$", RegexOptions.IgnoreCase);
        static readonly Regex Line = new(@"^\s*LINESTRING\s*\(\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?)+\s*\)\s*$", RegexOptions.IgnoreCase);
        static readonly Regex Polygon = new(@"^\s*POLYGON\s*\(\s*\(\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?)+\s*\)\s*\)\s*$", RegexOptions.IgnoreCase);

        public static bool ValidName(string name) => !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= 200;
        public static bool ValidWkt(string wkt) => !string.IsNullOrWhiteSpace(wkt) && (Point.IsMatch(wkt) || Line.IsMatch(wkt) || Polygon.IsMatch(wkt));
    }
}
