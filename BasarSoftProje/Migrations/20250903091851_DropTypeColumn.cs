using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasarSoftProje.Migrations
{
    /// <inheritdoc />
    public partial class DropTypeColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                schema: "public",
                table: "features");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "public",
                table: "features",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
