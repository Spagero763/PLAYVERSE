# Remove delegation, envio, and agents files
# Run this from the repo root in PowerShell:
#   Set-Location 'C:\Users\user\Downloads\PLAYVERSE-main'
#   .\scripts\remove-delegation.ps1

$paths = @(
  'src\components\delegations',
  'src\app\delegations',
  'src\app\api\delegations',
  'src\lib\envio',
  'src\lib\delegation',
  'src\app\agents'
)

foreach ($p in $paths) {
  $full = Join-Path (Get-Location) $p
  if (Test-Path $full) {
    Write-Host "Removing: $full"
    Remove-Item -LiteralPath $full -Recurse -Force -ErrorAction SilentlyContinue
  } else {
    Write-Host "Not found: $full"
  }
}

Write-Host 'Done. Please run `npm install` to refresh node_modules and package-lock.json if you modified package.json.'
