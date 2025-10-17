# Test login with all users

$users = @(
    @{email="admin@acme.com"; password="password123"},
    @{email="test@test.com"; password="test123"},
    @{email="admin@test.com"; password="password123"}
)

foreach ($user in $users) {
    Write-Host "Testing: $($user.email)" -ForegroundColor Cyan
    
    $result = curl.exe -X POST http://localhost:3002/api/auth/login `
      -H "Content-Type: application/json" `
      -d "{`"email`":`"$($user.email)`",`"password`":`"$($user.password)`"}" `
      --silent
    
    if ($result -match "accessToken") {
        Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "  $result" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ FAILED: $result" -ForegroundColor Red
    }
    Write-Host ""
}
