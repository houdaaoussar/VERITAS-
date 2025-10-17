# Test script for the ingest endpoint

$filePath = "sample_emissions_data.csv"
$uri = "http://localhost:3002/api/ingest"

Write-Host "Testing ingest endpoint..." -ForegroundColor Cyan
Write-Host "File: $filePath" -ForegroundColor Yellow
Write-Host "Endpoint: $uri" -ForegroundColor Yellow
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
    
    # Make request
    $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}
