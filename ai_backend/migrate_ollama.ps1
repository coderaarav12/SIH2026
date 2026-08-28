Write-Host "Stopping Ollama processes..."
Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ollama app" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Creating F:\OllamaModels directory..."
New-Item -Path "F:\OllamaModels" -ItemType Directory -Force | Out-Null

Write-Host "Moving models from C: to F: (This might take a minute)..."
if (Test-Path "C:\Users\aarav\.ollama\models\*") {
    Move-Item -Path "C:\Users\aarav\.ollama\models\*" -Destination "F:\OllamaModels\" -Force
}

Write-Host "Setting OLLAMA_MODELS environment variable..."
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "F:\OllamaModels", "User")

Write-Host "Migration complete!"
