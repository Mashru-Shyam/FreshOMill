namespace FreshOMill.Application.Catalog.Admin;

/// <summary>Shared by Create/UpdateProductCommand. <paramref name="Id"/> is null for a
/// newly-added variant row and set for one that already exists — UpdateProductCommandHandler
/// uses it to tell "edit this row" from "add a new row" apart while replacing the variant list.</summary>
public sealed record ProductVariantInput(Guid? Id, string Label, decimal Price, int StockQuantity, int SortOrder);
