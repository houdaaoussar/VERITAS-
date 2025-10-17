# Test login using curl.exe

Write-Host "Testing login with curl.exe..." -ForegroundColor Cyan
Write-Host ""

$result = curl.exe -X POST http://localhost:3002/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"test123\"}' `
  --silent

Write-Host "Response:" -ForegroundColor Yellow
Write-Host $result
