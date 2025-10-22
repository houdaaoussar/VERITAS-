Write-Host "Testing root endpoint..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "http://localhost:3002/"
Write-Host "Status: $($response.status)" -ForegroundColor Green
Write-Host "Message: $($response.message)" -ForegroundColor White
$response | ConvertTo-Json
