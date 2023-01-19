using DoggyFrictions.ExternalApi.Domain;
using DoggyFrictions.ExternalApi.Services;
using DoggyFrictions.ExternalApi.Services.Repository;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

builder.Services.AddSingleton<IRepository, MongoRepository>(_ =>
    new(new MongoClient(configuration.GetConnectionString("mongo"))));
builder.Services.AddSingleton<IMoneyMoverService, MoneyMoverService>();
builder.Services.AddSingleton<IDebtService, DebtService>();
builder.Services.AddSingleton<SessionActionsProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();
app.UsePathBase("/api");

app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
