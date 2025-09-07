using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasarSoftProje.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTypeDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Type",
                schema: "public",
                table: "features",
                type: "character varying(1)",
                maxLength: 1,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1)",
                oldMaxLength: 1,
                oldDefaultValue: "A");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Type",
                schema: "public",
                table: "features",
                type: "character varying(1)",
                maxLength: 1,
                nullable: false,
                defaultValue: "A",
                oldClrType: typeof(string),
                oldType: "character varying(1)",
                oldMaxLength: 1);
        }
    }
}
