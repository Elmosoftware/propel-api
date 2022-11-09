$currPath = [System.Environment]::GetEnvironmentVariable("Path")

$currPath += ";C:\Program Files\MongoDB\Server\6.0\bin"

[System.Environment]::SetEnvironmentVariable("Path", $currPath, [System.EnvironmentVariableTarget]::Machine)

Write-Host "Changes done..."
$currPath
#Need to close the console to see the changes
#[System.Environment]::GetEnvironmentVariable("Path")
