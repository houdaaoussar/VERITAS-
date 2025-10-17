# Test script for the ingest/test endpoint (NO AUTHENTICATION REQUIRED)

$baseUri = "http://localhost:3002"
$filePath = "sample_emissions_data.csv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Ingest Endpoint (NO AUTH)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "File: $filePath" -ForegroundColor Yellow
Write-Host "Endpoint: $baseUri/api/ingest/test" -ForegroundColor Yellow
Write-Host ""

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
    
    # Make request WITHOUT authentication
    $response = Invoke-RestMethod -Uri "$baseUri/api/ingest/test" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    
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
            $confidence = [math]::Round($mapping.confidence * 100, 1)
            Write-Host "  - $($mapping.sourceColumn) → $($mapping.targetField) (${confidence}% confidence)" -ForegroundColor Gray
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
    } else {
        Write-Host "✅ No issues found!" -ForegroundColor Green
        Write-Host ""
    }
    
    if ($response.data) {
        Write-Host "Preview Data (first 5 rows):" -ForegroundColor Cyan
        $response.data | Select-Object -First 5 | ForEach-Object {
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
