$currPath = [System.Environment]::GetEnvironmentVariable("Path")

$currPath = $currPath.replace("\MongoDB\Server\5.0\bin", "\MongoDB\Server\6.0\bin")

[System.Environment]::SetEnvironmentVariable("Path", $currPath, [System.EnvironmentVariableTarget]::Machine)

Write-Host "Changes done..."
$currPath
#Need to close the console to see the changes
#[System.Environment]::GetEnvironmentVariable("Path")
