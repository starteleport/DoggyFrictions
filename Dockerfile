FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["DoggyFrictions.ExternalApi/DoggyFrictions.ExternalApi.csproj", "DoggyFrictions.ExternalApi/"]
RUN dotnet restore "DoggyFrictions.ExternalApi/DoggyFrictions.ExternalApi.csproj"
COPY . .
WORKDIR "/src/DoggyFrictions.ExternalApi"
RUN dotnet build "DoggyFrictions.ExternalApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DoggyFrictions.ExternalApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DoggyFrictions.ExternalApi.dll"]
