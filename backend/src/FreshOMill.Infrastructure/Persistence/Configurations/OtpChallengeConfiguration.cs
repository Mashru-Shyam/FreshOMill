using FreshOMill.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class OtpChallengeConfiguration : IEntityTypeConfiguration<OtpChallenge>
{
    public void Configure(EntityTypeBuilder<OtpChallenge> builder)
    {
        builder.Property(c => c.Email).HasMaxLength(320).IsRequired();
        builder.Property(c => c.CodeHash).HasMaxLength(128).IsRequired();
        builder.HasIndex(c => c.Email);
    }
}
