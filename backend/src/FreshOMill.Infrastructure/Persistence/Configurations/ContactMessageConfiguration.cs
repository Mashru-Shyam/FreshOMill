using FreshOMill.Domain.Contact;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.Property(m => m.Name).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Email).HasMaxLength(320).IsRequired();
        builder.Property(m => m.Phone).HasMaxLength(20);
        builder.Property(m => m.Message).HasMaxLength(4000).IsRequired();
    }
}
