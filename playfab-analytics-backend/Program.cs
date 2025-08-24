using PlayFabAnalytics.Services;
using PlayFabAnalytics.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure PlayFab settings
builder.Services.Configure<PlayFabSettings>(
    builder.Configuration.GetSection("PlayFab"));

// Register application services
builder.Services.AddScoped<IPlayFabService, PlayFabService>();
builder.Services.AddScoped<IPlayerAnalyticsService, PlayerAnalyticsService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();