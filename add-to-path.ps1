$pythonScripts = "C:\Users\Dell\AppData\Roaming\Python\Python313\Scripts"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$pythonScripts*") {
    $newPath = $currentPath + ";" + $pythonScripts
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✅ Added Python Scripts to PATH"
    Write-Host "Please restart your terminal for changes to take effect"
} else {
    Write-Host "Python Scripts already in PATH"
}
