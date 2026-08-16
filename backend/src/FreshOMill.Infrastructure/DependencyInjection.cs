using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Contact;
using FreshOMill.Infrastructure.Email;
using FreshOMill.Infrastructure.Identity;
using FreshOMill.Infrastructure.Payments;
using FreshOMill.Infrastructure.Persistence;
using FreshOMill.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace FreshOMill.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("Connection string 'Postgres' was not found.");

        services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<ITokenService, JwtTokenService>();

        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        _ = configuration.GetSection(EmailOptions.SectionName).Get<EmailOptions>()
            ?? throw new InvalidOperationException(
                $"Configuration section '{EmailOptions.SectionName}' is missing (set Email:FromAddress, " +
                "Email:FromName in appsettings.json).");

        services.Configure<ResendOptions>(configuration.GetSection(ResendOptions.SectionName));
        services.AddHttpClient<IEmailService, ResendEmailService>(client =>
            client.BaseAddress = new Uri("https://api.resend.com/"));
        _ = configuration.GetSection(ResendOptions.SectionName).Get<ResendOptions>()
            ?? throw new InvalidOperationException(
                $"Configuration section '{ResendOptions.SectionName}' is missing (set Resend:ApiKey via user-secrets/env vars).");

        services.Configure<RazorpayOptions>(configuration.GetSection(RazorpayOptions.SectionName));
        services.AddHttpClient<IPaymentGatewayService, RazorpayPaymentGatewayService>(client =>
            client.BaseAddress = new Uri("https://api.razorpay.com/v1/"));
        _ = configuration.GetSection(RazorpayOptions.SectionName).Get<RazorpayOptions>()
            ?? throw new InvalidOperationException(
                $"Configuration section '{RazorpayOptions.SectionName}' is missing (set Razorpay:KeySecret, " +
                "Razorpay:WebhookSecret via user-secrets/env vars — Razorpay:KeyId lives in appsettings.json).");

        services.Configure<ContactOptions>(configuration.GetSection(ContactOptions.SectionName));

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException(
                $"Configuration section '{JwtOptions.SectionName}' is missing (set Jwt:SigningKey via user-secrets/env vars).");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(jwtOptions.SigningKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

        services.AddAuthorization();

        services
            .AddHealthChecks()
            .AddNpgSql(connectionString, name: "postgres", tags: ["ready"]);

        return services;
    }
}
