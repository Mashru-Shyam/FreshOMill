FROM mcr.microsoft.com/dotnet/sdk:10.0 AS base
WORKDIR /src

COPY ["Directory.Build.props", "Directory.Packages.props", "./"]
COPY ["src/FreshOMill.Domain/FreshOMill.Domain.csproj", "src/FreshOMill.Domain/"]
COPY ["src/FreshOMill.Application/FreshOMill.Application.csproj", "src/FreshOMill.Application/"]
COPY ["src/FreshOMill.Infrastructure/FreshOMill.Infrastructure.csproj", "src/FreshOMill.Infrastructure/"]
COPY ["src/FreshOMill.Api/FreshOMill.Api.csproj", "src/FreshOMill.Api/"]
RUN dotnet restore "src/FreshOMill.Api/FreshOMill.Api.csproj"

FROM base AS dev
COPY src/ src/
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "watch", "run", "--no-launch-profile", "--project", "src/FreshOMill.Api", "--urls", "http://+:8080"]

FROM base AS build
COPY src/ src/
RUN dotnet publish "src/FreshOMill.Api/FreshOMill.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS production
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "FreshOMill.Api.dll"]
