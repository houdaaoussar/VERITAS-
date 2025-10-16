# Push CSV documentation and fixes to GitHub

Set-Location "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"

Write-Host "=== Adding files ===" -ForegroundColor Green
git add .

Write-Host "`n=== Committing ===" -ForegroundColor Green
git commit -m "Add CSV upload documentation and troubleshooting guides"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Green
git push

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Documentation added:" -ForegroundColor Cyan
Write-Host "  - CSV_UPLOAD_GUIDE.md" -ForegroundColor White
Write-Host "  - TROUBLESHOOTING_CSV_UPLOAD.md" -ForegroundColor White
Write-Host "  - sample_emissions_template.csv" -ForegroundColor White
