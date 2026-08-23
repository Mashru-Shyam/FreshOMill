using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreshOMill.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminPanelMvp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "Customer");

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "Products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "StoreSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    WhatsAppNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    OpeningHours = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    InstagramUrl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    YoutubeUrl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    LinkedInUrl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    GoogleMapsUrl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreSettings", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000001"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000002"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000003"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000004"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000005"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000006"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000007"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000008"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000009"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000010"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000011"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000012"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000013"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000014"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000015"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000016"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000017"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000018"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000019"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000020"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000021"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000022"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000023"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000024"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000025"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000026"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000027"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000028"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000029"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000030"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000031"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000032"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000033"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000034"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000035"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000036"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000037"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000038"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000039"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000040"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000041"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000042"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000043"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000044"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000045"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000046"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000047"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000048"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000049"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000050"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000051"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000052"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000053"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000054"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000055"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000056"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000057"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000058"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000059"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000060"),
                column: "IsFeatured",
                value: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000061"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000062"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000063"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000064"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000065"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000066"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000067"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000068"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000069"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000070"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000071"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000072"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000073"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("d0a80001-0000-0000-0000-000000000074"),
                column: "IsFeatured",
                value: false);

            migrationBuilder.InsertData(
                table: "StoreSettings",
                columns: new[] { "Id", "Address", "Created", "CreatedBy", "Email", "GoogleMapsUrl", "InstagramUrl", "LastModified", "LastModifiedBy", "LinkedInUrl", "OpeningHours", "Phone", "WhatsAppNumber", "YoutubeUrl" },
                values: new object[] { new Guid("50a80001-0000-0000-0000-000000000001"), "Freshomill, GF - 3/4, Nexus Complex, Near Spring Retreat 4, White House Lane, Bhayli TP 1, Vasna Bhayli Road, Vadodara", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "mashrushyam37@gmail.com", "https://maps.app.goo.gl/b6igQ81rRruLUmxC6", "https://instagram.com/freshomill", null, null, "https://linkedin.com/company/freshomill", "Everyday: 9:30 AM - 8:00 PM", "+91 76000 62637", "+917600062637", "https://youtube.com/@freshomill" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Products");
        }
    }
}
