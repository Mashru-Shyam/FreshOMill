using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreshOMill.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTestimonialAdminAndVideo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Testimonials",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Testimonials");
        }
    }
}
