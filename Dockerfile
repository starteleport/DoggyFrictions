# .NET version of the build and runtime images; keep in sync with <TargetFramework> in Directory.Build.props.
ARG DOTNET_VERSION=10.0
# Node.js that builds the front end (Vite needs 20.19+ or 22.12+).
ARG NODE_VERSION=24

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION}-alpine AS base
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
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION}-alpine AS sdk

# The front end (ClientApp/): unit tests, type check and the Vite build into wwwroot/dist.
FROM node:${NODE_VERSION}-alpine AS frontend
WORKDIR /build/src/DoggyFrictions.ExternalApi
COPY ["src/DoggyFrictions.ExternalApi/package.json", "src/DoggyFrictions.ExternalApi/package-lock.json", "./"]
RUN npm ci
COPY ["src/DoggyFrictions.ExternalApi/vite.config.ts", "src/DoggyFrictions.ExternalApi/tsconfig.json", "./"]
COPY ["src/DoggyFrictions.ExternalApi/ClientApp", "ClientApp"]
RUN npm test && npm run build

FROM sdk AS restore-dotnet
WORKDIR /build
COPY ["src/DoggyFrictions.ExternalApi/DoggyFrictions.ExternalApi.csproj", "src/DoggyFrictions.ExternalApi/"]
COPY ["tests/DoggyFrictions.ExternalApi.Tests/DoggyFrictions.ExternalApi.Tests.csproj", "tests/DoggyFrictions.ExternalApi.Tests/"]
COPY ["Directory.Build.props", "."]
COPY ["DoggyFrictions.slnx", "."]
RUN dotnet restore

FROM restore-dotnet AS copy-all
WORKDIR /build
COPY . .

FROM copy-all AS build
WORKDIR /build
RUN dotnet build -c Release --no-restore

FROM build AS publish
WORKDIR /build/src/DoggyFrictions.ExternalApi
COPY --from=frontend /build/src/DoggyFrictions.ExternalApi/wwwroot/dist wwwroot/dist
RUN dotnet publish "DoggyFrictions.ExternalApi.csproj" --no-build -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DoggyFrictions.ExternalApi.dll"]
