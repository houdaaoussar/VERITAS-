Write-Host "Testing Backend..." -ForegroundColor Cyan

$response = Invoke-RestMethod -Uri "http://localhost:3002/health"
Write-Host "Backend Status: $($response.status)" -ForegroundColor Green
Write-Host "Version: $($response.version)" -ForegroundColor White

Write-Host "`nBackend is running on: http://localhost:3002" -ForegroundColor Green
Write-Host "Frontend should be on: http://localhost:5173" -ForegroundColor Green
