# Push updates to GitHub

Set-Location "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"

Write-Host "=== Committing changes ===" -ForegroundColor Green
git commit -m "Fix Amplify build configuration"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Green
git push

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "AWS Amplify will automatically rebuild your app!" -ForegroundColor Cyan
Write-Host "Check: https://console.aws.amazon.com/amplify/" -ForegroundColor Cyan
