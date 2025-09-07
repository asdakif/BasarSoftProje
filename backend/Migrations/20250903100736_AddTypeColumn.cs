using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasarSoftProje.Migrations
{
    /// <inheritdoc />
    public partial class AddTypeColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "public",
                table: "features",
                type: "character varying(1)",
                maxLength: 1,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                schema: "public",
                table: "features");
        }
    }
}
