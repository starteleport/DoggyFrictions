FROM mcr.microsoft.com/dotnet/aspnet:6.0-alpine3.17 AS base
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_CLI_UI_LANGUAGE=en-US \
    DOTNET_SVCUTIL_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    POWERSHELL_TELEMETRY_OPTOUT=1 \
    POWERSHELL_UPDATECHECK_OPTOUT=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 \
    DOTNET_ROLL_FORWARD=Major \
    DOTNET_ROLL_FORWARD_TO_PRERELEASE=1 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    NUGET_CERT_REVOCATION_MODE=offline
RUN apk add --no-cache icu-libs tzdata
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["src/DoggyFrictions.ExternalApi/DoggyFrictions.ExternalApi.csproj", "src/DoggyFrictions.ExternalApi/"]
COPY ["tests/DoggyFrictions.ExternalApi.Tests/DoggyFrictions.ExternalApi.Tests.csproj", "tests/DoggyFrictions.ExternalApi.Tests/"]
COPY ["DoggyFrictions.sln", "DoggyFrictions.sln"]
RUN dotnet restore
COPY . .
WORKDIR "/src/src/DoggyFrictions.ExternalApi"
RUN dotnet build "DoggyFrictions.ExternalApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DoggyFrictions.ExternalApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DoggyFrictions.ExternalApi.dll"]
