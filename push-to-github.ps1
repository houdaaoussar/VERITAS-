# Git Push Script

# Navigate to project directory
Set-Location "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"

# Configure git
git config user.name "houdaaoussar"
git config user.email "houdaaoussar9@gmail.com"

# Check status
Write-Host "=== Git Status ===" -ForegroundColor Green
git status

# Commit changes
Write-Host "`n=== Committing changes ===" -ForegroundColor Green
git commit -m "Initial commit - HoudaProject deployed to AWS"

# Add remote
Write-Host "`n=== Adding remote ===" -ForegroundColor Green
git remote add origin https://github.com/houdaaoussar/VERITAS-.git

# Set main branch
Write-Host "`n=== Setting main branch ===" -ForegroundColor Green
git branch -M main

# Push to GitHub
Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Green
git push -u origin main

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Your code is now on GitHub!" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/houdaaoussar/VERITAS-" -ForegroundColor Cyan
