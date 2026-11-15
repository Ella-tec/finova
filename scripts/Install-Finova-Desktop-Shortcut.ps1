param(
  [string]$AppUrl = "https://finova.ai",
  [string]$ShortcutName = "Finova"
)

$ErrorActionPreference = "Stop"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop ($ShortcutName + ".lnk")
$iconDirectory = Join-Path $env:LOCALAPPDATA "Finova"
$iconPath = Join-Path $iconDirectory "finova.ico"
$pngPath = Join-Path $iconDirectory "finova.png"
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
$baseUrl = $AppUrl.TrimEnd([char]"/")
$pngUrl = $baseUrl + "/favicon-32x32.png"
Invoke-WebRequest -Uri $pngUrl -OutFile $pngPath -UseBasicParsing
if (-not (Test-Path $pngPath) -or (Get-Item $pngPath).Length -lt 100) { throw "Finova PNG icon download failed: $pngUrl" }
Add-Type -AssemblyName System.Drawing
$bitmap = [System.Drawing.Bitmap]::FromFile($pngPath)
$iconHandle = $bitmap.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = [System.IO.File]::Create($iconPath)
try { $icon.Save($stream) } finally { $stream.Dispose(); $icon.Dispose(); $bitmap.Dispose(); [void][System.Runtime.InteropServices.Marshal]::DestroyIcon($iconHandle) }
if (-not (Test-Path $iconPath) -or (Get-Item $iconPath).Length -lt 100) { throw "Could not create the Windows ICO file." }
$browser = Get-Command msedge.exe -ErrorAction SilentlyContinue
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
if ($browser) {
  $shortcut.TargetPath = $browser.Source
  $shortcut.Arguments = "--app=" + $AppUrl
  $shortcut.WorkingDirectory = Split-Path $browser.Source
} else {
  $shortcut.TargetPath = $AppUrl
}
$shortcut.IconLocation = $iconPath + ",0"
$shortcut.Description = "Open Finova accounting, audit and finance workspace"
$shortcut.Save()
Write-Host ("Finova desktop shortcut created: " + $shortcutPath) -ForegroundColor Green
Write-Host ("Icon saved to: " + $iconPath)
