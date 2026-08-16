using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Catalog;

public sealed class Category : BaseAuditableEntity<Guid>
{
    public required string Slug { get; set; }

    public required string Name { get; set; }

    public string? ImageUrl { get; set; }

    /// <summary>Lower sorts first. Drives the "10 visible + rest under View All" split on the homepage grid.</summary>
    public int DisplayOrder { get; set; }
}
