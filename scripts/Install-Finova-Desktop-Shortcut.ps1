$ErrorActionPreference = "Stop"

$ProjectPath = (Get-Location).Path
$ShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "Finova.lnk"
$VSCode = Get-Command code -ErrorAction SilentlyContinue

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

if ($VSCode) {
    $Shortcut.TargetPath = $VSCode.Source
    $Shortcut.Arguments = "`"$ProjectPath`""
    $Shortcut.WorkingDirectory = $ProjectPath
    $Shortcut.Description = "Open Finova in Visual Studio Code"
} else {
    $Shortcut.TargetPath = "explorer.exe"
    $Shortcut.Arguments = "`"$ProjectPath`""
    $Shortcut.Description = "Open the Finova project folder"
}

$Shortcut.Save()

Write-Host "Finova desktop shortcut created:"
Write-Host $ShortcutPath