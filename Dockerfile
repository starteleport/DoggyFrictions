FROM mcr.microsoft.com/dotnet/aspnet:6.0-alpine AS base
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

FROM mcr.microsoft.com/dotnet/sdk:6.0-alpine AS sdk

FROM sdk AS nodejs
RUN apk add --update npm

FROM nodejs as restore-npm
WORKDIR /build

COPY ["src/DoggyFrictions.ExternalApi/package.json", "src/DoggyFrictions.ExternalApi/"]
COPY ["src/DoggyFrictions.ExternalApi/package-lock.json", "src/DoggyFrictions.ExternalApi/"]

WORKDIR /build/src/DoggyFrictions.ExternalApi
RUN NODE_ENV=development npm install

FROM sdk AS restore-dotnet
WORKDIR /build
COPY ["src/DoggyFrictions.ExternalApi/DoggyFrictions.ExternalApi.csproj", "src/DoggyFrictions.ExternalApi/"]
COPY ["tests/DoggyFrictions.ExternalApi.Tests/DoggyFrictions.ExternalApi.Tests.csproj", "tests/DoggyFrictions.ExternalApi.Tests/"]
COPY ["Directory.Build.props", "."]
COPY ["DoggyFrictions.sln", "."]
RUN dotnet restore

FROM restore-npm AS gulp-prod
WORKDIR /build/src/DoggyFrictions.ExternalApi
COPY ["src/DoggyFrictions.ExternalApi/gulpfile.js", "."]
COPY ["src/DoggyFrictions.ExternalApi/wwwroot", "wwwroot"]
COPY ["src/DoggyFrictions.ExternalApi/Styles", "Styles"]
RUN ./node_modules/gulp-cli/bin/gulp.js prod

FROM restore-dotnet AS build
WORKDIR /build
COPY . .
RUN dotnet build -c Release --no-restore

FROM build AS publish
WORKDIr /build/src/DoggyFrictions.ExternalApi
COPY --from=gulp-prod /build/src/DoggyFrictions.ExternalApi/wwwroot wwwroot
RUN dotnet publish "DoggyFrictions.ExternalApi.csproj" --no-build -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DoggyFrictions.ExternalApi.dll"]
