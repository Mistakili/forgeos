Write-Host "Building ForgeOS production image..."
docker compose build

Write-Host "Starting ForgeOS on http://localhost:8000"
docker compose up -d

Start-Sleep -Seconds 3
Write-Host "Health check..."
Invoke-RestMethod http://localhost:8000/api/health | ConvertTo-Json

Write-Host ""
Write-Host "ForgeOS is live. Open http://localhost:8000"