using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FreshOMill.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroSlidesAndTestimonials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HeroSlides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Alt = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Subtitle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    FallbackGradient = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HeroSlides", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Testimonials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Initial = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    AvatarGradient = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Testimonials", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "HeroSlides",
                columns: new[] { "Id", "Alt", "Created", "CreatedBy", "DisplayOrder", "FallbackGradient", "Icon", "ImageUrl", "LastModified", "LastModifiedBy", "Subtitle", "Title" },
                values: new object[,]
                {
                    { new Guid("e0a80001-0000-0000-0000-000000000001"), "Stone-ground wheat flour and whole wheat grains beside a traditional millstone", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 1, "linear-gradient(135deg, #1f736f 0%, #4553c4 100%)", "wheat", "/images/hero/hero-stone-ground-atta.jpg", null, null, "Milled strictly after your order is placed", "100% Stone-Ground Chakki Fresh Atta" },
                    { new Guid("e0a80001-0000-0000-0000-000000000002"), "Bowls of organic multi-grain flours — millet, corn, sorghum and ragi", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 2, "linear-gradient(135deg, #1f7a50 0%, #1f736f 100%)", "sprout", "/images/hero/hero-multigrain-essentials.jpg", null, null, "Sourced directly from local certified organic farms", "Pure & Organic Multi-Grain Essentials" },
                    { new Guid("e0a80001-0000-0000-0000-000000000003"), "Freshly packed flour sacks tied and labeled, ready for delivery", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 3, "linear-gradient(135deg, #9c3d18 0%, #c07a2c 100%)", "package-check", "/images/hero/hero-packed-on-order.jpg", null, null, "Zero preservatives, zero adulterants — guaranteed", "Washed, Cleaned & Packed on Order" }
                });

            migrationBuilder.InsertData(
                table: "Testimonials",
                columns: new[] { "Id", "AvatarGradient", "Created", "CreatedBy", "DisplayOrder", "Initial", "LastModified", "LastModifiedBy", "Name", "Text" },
                values: new object[,]
                {
                    { new Guid("f0a80001-0000-0000-0000-000000000001"), "linear-gradient(135deg, var(--color-brand-brown), var(--color-secondary))", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 1, "A", null, null, "Ananya R.", "The chakki-fresh atta tastes completely different from what we used to buy — you can actually smell the wheat. Packaging is clean and delivery was quicker than I expected. Genuinely happy with the switch...." },
                    { new Guid("f0a80001-0000-0000-0000-000000000002"), "linear-gradient(135deg, var(--color-secondary), var(--color-primary))", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 2, "R", null, null, "Rahul K.", "Ordered the cold-pressed groundnut oil and a few spice powders — everything felt genuinely fresh, not sitting-on-a-shelf-for-months fresh. No unnecessary plastic either, which I appreciated a lot...." },
                    { new Guid("f0a80001-0000-0000-0000-000000000003"), "linear-gradient(135deg, var(--color-brand-green), var(--color-primary))", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 3, "M", null, null, "Meera S.", "I've been buying millets and dry fruits for a few months now and the quality has been consistent every single time. Support on WhatsApp was also quick to sort out a delivery delay...." }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HeroSlides");

            migrationBuilder.DropTable(
                name: "Testimonials");
        }
    }
}
