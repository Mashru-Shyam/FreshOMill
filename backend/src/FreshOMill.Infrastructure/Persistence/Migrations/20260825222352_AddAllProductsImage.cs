using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreshOMill.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAllProductsImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllProductsImageUrl",
                table: "StoreSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllProductsImageUrl",
                table: "StoreSettings");
        }
    }
}
