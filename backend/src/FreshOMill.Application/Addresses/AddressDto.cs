namespace FreshOMill.Application.Addresses;

public sealed record AddressDto(
    Guid Id,
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode,
    bool IsDefault);
