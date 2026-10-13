$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw '.NET Framework compiler not found.' }
$helperFolder = Join-Path $projectRoot 'kvn-command\helper'
$outputFolder = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Path $helperFolder, $outputFolder -Force | Out-Null
& $compiler /nologo /target:winexe /platform:anycpu /optimize+ /r:System.Windows.Forms.dll /r:System.Web.Extensions.dll "/out:$helperFolder\KVNConsoleHotkey.exe" "$PSScriptRoot\HotkeyHelper.cs"
if ($LASTEXITCODE -ne 0) { throw 'Helper compilation failed.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$payload = Join-Path $outputFolder 'payload.zip'
if (Test-Path -LiteralPath $payload) { Remove-Item -LiteralPath $payload }
$sourceRoot = Join-Path $projectRoot 'kvn-command'
$archive = [IO.Compression.ZipFile]::Open($payload, [IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force | Where-Object { $_.Name -ne '.debug' } | ForEach-Object {
        $entryName = $_.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entryName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose() }
& $compiler /nologo /target:winexe /platform:anycpu /optimize+ /r:System.Windows.Forms.dll /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll "/resource:$payload,payload.zip" "/out:$outputFolder\KVN command.exe" "$PSScriptRoot\Setup.cs"
if ($LASTEXITCODE -ne 0) { throw 'Installer compilation failed.' }
Write-Output "Built: $outputFolder\KVN command.exe"
