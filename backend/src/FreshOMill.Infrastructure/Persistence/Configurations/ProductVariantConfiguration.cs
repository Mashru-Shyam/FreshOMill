using System.Globalization;
using System.Text.RegularExpressions;
using FreshOMill.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed partial class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.Property(v => v.Label).HasMaxLength(50).IsRequired();
        builder.Property(v => v.Price).HasPrecision(10, 2);

        builder.HasOne(v => v.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(v => v.ProductId);

        builder.HasData(GetSeedVariants());
    }

    // Two pack sizes per product — the base size at its seeded price/stock, plus a double-size
    // pack at ~1.9x the price (bulk discount) and the same stock. Deterministic id/stock
    // generation so `dotnet ef migrations add` always produces the same rows: fixed prefixes
    // (d0a80002/d0a80003) keyed off each product's own seed suffix, and a stock count derived
    // from the product name the same way the old frontend-only stockCountFor() was — this is
    // seed data continuity, not a security-relevant algorithm.
    private static IEnumerable<object> GetSeedVariants()
    {
        foreach (var product in CatalogSeedData.Products)
        {
            var suffix = product.Id.ToString()[^12..];
            var variants = DeriveVariants(product.Price, product.Unit);
            var stock = product.InStock ? StockCountFor(product.Name) : 0;

            yield return new
            {
                Id = Guid.Parse($"d0a80002-0000-0000-0000-{suffix}"),
                Created = CatalogSeedData.SeedCreatedAt,
                ProductId = product.Id,
                variants[0].Label,
                variants[0].Price,
                StockQuantity = stock,
                SortOrder = 1,
            };

            // Units that don't parse as a plain kg/g/ml/l quantity (e.g. "60caps") only get one
            // fabricated pack size from DeriveVariants — nothing to double up as a second row.
            if (variants.Length > 1)
            {
                yield return new
                {
                    Id = Guid.Parse($"d0a80003-0000-0000-0000-{suffix}"),
                    Created = CatalogSeedData.SeedCreatedAt,
                    ProductId = product.Id,
                    variants[1].Label,
                    variants[1].Price,
                    StockQuantity = stock,
                    SortOrder = 2,
                };
            }
        }
    }

    [GeneratedRegex(@"^([\d.]+)\s*(kg|g|ml|l)$", RegexOptions.IgnoreCase)]
    private static partial Regex UnitPattern();

    /// <summary>C# port of the frontend's deriveWeightVariants() (shared/util/product-variants.ts)
    /// — kept in lockstep so seeded variant labels/prices match what the UI used to fabricate
    /// client-side. Units that don't parse as a plain kg/g/ml/l quantity (e.g. "60caps") fall back
    /// to a single variant at the product's own unit/price, same as the frontend did.</summary>
    private static (string Label, decimal Price)[] DeriveVariants(decimal price, string unit)
    {
        var match = UnitPattern().Match(unit);
        if (!match.Success)
        {
            return [(unit, price)];
        }

        var value = double.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
        var suffix = match.Groups[2].Value.ToLowerInvariant();
        var isLiquid = suffix is "ml" or "l";
        var baseAmount = suffix is "kg" or "l" ? value * 1000 : value;

        return
        [
            (Format(baseAmount, isLiquid), price),
            (Format(baseAmount * 2, isLiquid), Math.Round(price * 1.9m, 0, MidpointRounding.AwayFromZero)),
        ];
    }

    private static string Format(double amount, bool isLiquid)
    {
        if (amount < 1000)
        {
            return isLiquid ? $"{amount:0.#}ml" : $"{amount:0.#}g";
        }

        var divided = amount / 1000;
        var decimals = amount % 1000 == 0 ? 0 : 1;
        var formatted = divided.ToString(decimals == 0 ? "F0" : "F1", CultureInfo.InvariantCulture);
        return isLiquid ? $"{formatted}L" : $"{formatted}kg";
    }

    private static int StockCountFor(string name)
    {
        uint hash = 0;
        foreach (var ch in name)
        {
            unchecked
            {
                hash = hash * 31 + ch;
            }
        }
        return 3 + (int)(hash % 15);
    }
}
