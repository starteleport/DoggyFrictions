using DoggyFrictions.ExternalApi.Domain;
using DoggyFrictions.ExternalApi.Services;
using DoggyFrictions.ExternalApi.Services.Repository;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .AddEnvironmentVariables("ASPNETCORE_")
    .Build();

var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

builder.Services.AddSingleton<IRepository, MongoRepository>(_ =>
    new MongoRepository(new MongoClient(configuration.GetConnectionString("mongo"))));
builder.Services.AddTransient<IMoneyMoverService, MoneyMoverService>();
builder.Services.AddTransient<IDebtService, DebtService>();
builder.Services.AddTransient<SessionActionsProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//app.UseHttpsRedirection();
app.UseStaticFiles();
app.UsePathBase("/api");

app.UseRouting();

//app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();