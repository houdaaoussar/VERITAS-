# Test Backend Connection

Write-Host "🧪 Testing Backend..." -ForegroundColor Cyan

# Test port 3002
Write-Host "`nTesting http://localhost:3002/health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method Get
    Write-Host "✅ Backend is running on port 3002!" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
    Write-Host "Version: $($response.version)" -ForegroundColor White
    
    Write-Host "`n📋 Backend URLs:" -ForegroundColor Cyan
    Write-Host "Health: http://localhost:3002/health" -ForegroundColor White
    Write-Host "API: http://localhost:3002/api/health" -ForegroundColor White
    Write-Host "Upload Test: http://localhost:3002/api/ingest/test" -ForegroundColor White
    
} catch {
    Write-Host "❌ Backend not responding on port 3002" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
    
    # Try port 3000
    Write-Host "`nTrying port 3000..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
        Write-Host "✅ Backend is running on port 3000!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend not running on port 3000 either" -ForegroundColor Red
        Write-Host "`nMake sure to start the backend with npm run dev:backend" -ForegroundColor Yellow
    }
}

Write-Host ""
