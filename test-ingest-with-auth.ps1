# Test script for the ingest endpoint with authentication

$baseUri = "http://localhost:3002"
$filePath = "sample_emissions_data.csv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Ingest Endpoint with Auth" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get access token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@test.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUri/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $accessToken = $loginResponse.accessToken
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host "   Customer ID: $($loginResponse.user.customerId)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Test ingest endpoint (preview mode - no save)
Write-Host "Step 2: Testing ingest endpoint (preview mode)..." -ForegroundColor Yellow
Write-Host "   File: $filePath" -ForegroundColor Gray

try {
    # Read file content
    $fileContent = Get-Content -Path $filePath -Raw
    $fileName = Split-Path $filePath -Leaf
    
    # Create boundary
    $boundary = [System.Guid]::NewGuid().ToString()
    
    # Build multipart form data
    $LF = "`r`n"
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
        "Content-Type: text/csv$LF",
        $fileContent,
        "--$boundary--$LF"
    ) -join $LF
    
    # Make request with authentication
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUri/api/ingest" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines -Headers $headers
    
    Write-Host "✅ Ingest successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "RESULTS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    Write-Host "Rows Imported: $($response.rows_imported)" -ForegroundColor Yellow
    Write-Host "Rows Failed: $($response.rows_failed)" -ForegroundColor $(if ($response.rows_failed -gt 0) { "Red" } else { "Green" })
    Write-Host ""
    
    if ($response.header_mappings) {
        Write-Host "Header Mappings:" -ForegroundColor Cyan
        foreach ($mapping in $response.header_mappings) {
            Write-Host "  - $($mapping.sourceColumn) → $($mapping.targetField) (confidence: $($mapping.confidence))" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    if ($response.available_categories) {
        Write-Host "Available Categories:" -ForegroundColor Cyan
        foreach ($category in $response.available_categories) {
            Write-Host "  - $($category.name)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    if ($response.issues -and $response.issues.Count -gt 0) {
        Write-Host "Issues Found:" -ForegroundColor Red
        foreach ($issue in $response.issues) {
            Write-Host "  Row $($issue.row_index):" -ForegroundColor Yellow
            foreach ($error in $issue.errors) {
                Write-Host "    - $error" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
    
    if ($response.data) {
        Write-Host "Preview Data (first 3 rows):" -ForegroundColor Cyan
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - Category: $($_.emission_category), Site: $($_.site_name), Qty: $($_.quantity) $($_.unit)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Full Response (JSON):" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Ingest failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
