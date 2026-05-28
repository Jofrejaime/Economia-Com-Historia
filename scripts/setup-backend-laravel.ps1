param(
    [string]$ProjectRoot = (Join-Path $PSScriptRoot '..'),
    [string]$BackendDir = 'backend'
)

$ErrorActionPreference = 'Stop'

$projectPath = Resolve-Path $ProjectRoot
$backendPath = Join-Path $projectPath $BackendDir

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw 'Composer nao encontrado no PATH.'
}

if (-not (Test-Path $backendPath)) {
    New-Item -ItemType Directory -Path $backendPath | Out-Null
}

$hasLaravelSkeleton = Test-Path (Join-Path $backendPath 'artisan') -and Test-Path (Join-Path $backendPath 'composer.json')

if (-not $hasLaravelSkeleton) {
    Write-Host 'A criar projeto Laravel em backend...'
    Push-Location $projectPath
    try {
        composer create-project laravel/laravel $BackendDir
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host 'Backend Laravel já parece inicializado. Nenhuma acao executada.'
}

Write-Host 'Concluido.'