param(
  [string]$AppUrl = "https://finova.ai",
  [string]$ShortcutName = "Finova"
)

$ErrorActionPreference = "Stop"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop ($ShortcutName + ".lnk")
$iconDirectory = Join-Path $env:LOCALAPPDATA "Finova"
$iconPath = Join-Path $iconDirectory "finova.ico"
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
$baseUrl = $AppUrl.TrimEnd([char]"/")
$iconUrl = $baseUrl + "/favicon.ico"
Invoke-WebRequest -Uri $iconUrl -OutFile $iconPath -UseBasicParsing
if (-not (Test-Path $iconPath) -or (Get-Item $iconPath).Length -lt 100) { throw "Finova icon download failed: $iconUrl" }
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
