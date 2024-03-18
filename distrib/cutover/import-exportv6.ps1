param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Action, 
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$DestFolder,    
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$DBName,
    [string]$HostName = "127.0.0.1",
    [int]$Port = 27017,
    [switch]$Help
)

$MongoShell = "C:\Program Files\MongoDB\Server\6.0\bin\mongosh.exe"
$MongoToolsFolder = "C:\Program Files\MongoDB\Tools\100\bin\"
$ImportExec = "mongoimport"
$ExportExec = "mongoexport"

Write-Host ("Args: `r`nAction:""$Action""`r`nDestFolder: ""$DestFolder""`r`nHostName: ""$HostName""`r`nPort: ""$Port""`r`nDBName: ""$DBName""`r`n")

if ($Help) {
    Write-Host @"
    Import and Export Collections from a Mongo Database
    ===================================================

    Parameters:
    -Help: Show this help
    -Action: Could be one of the following values:
        import: Allow to import all the exported data to the indicated DB.
        export: Can export all the collections to the indicated folder.
    -DestFolder: Destination for the exported data or from where the data will be imported.
    -DBName: Name of the target DB.
    -HostName: Host or IP of the Mongo DB Instance. If not specified the value "localhost" will be used.
    -Port: Port wher the Mongo DB instance is listening. If not specified the value 27017 will be used.
"@
    exit
}

#region "Internal Methods"
function GetCollections() {
param (
    [string]$User = "",
    [string]$Password = ""

)    
    $procInfo = New-Object System.Diagnostics.ProcessStartInfo
    $proc = New-Object System.Diagnostics.Process
    $ret = $null
    $err = "";  

    try {
        $procInfo.FileName = $MongoShell
        $procInfo.RedirectStandardOutput = $true
        $procInfo.RedirectStandardError = $true
        $procInfo.UseShellExecute = $false
        $procInfo.Arguments = "--host $HostName --port $Port --username $User --password $Password --eval ""db.getCollectionNames()"" --quiet $DBName"
    
        $proc.StartInfo = $procInfo
        $proc.Start() | Out-Null
        $proc.WaitForExit()
    }
    catch {
       Throw "There was an error trying to retrieve the DB Collections list.\n Error details:`r`n[" + 
            $_.Exception.GetType().FullName + "]: " + $_.Exception.Message
    }
      
    $ret = Invoke-Expression $proc.StandardOutput.ReadToEnd().Replace("[", "@(").Replace("]", ")")
    $err = $proc.StandardError.ReadToEnd()

    if ([String]::IsNullOrEmpty($err)) {
        return $ret
    }
    else {
        Throw "There was an error trying to retrieve the DB Collections list.\n Error details: $err"
    }
}
#endregion

$cred = Get-Credential "PropelUser"
$u = ""
$p = ""

if($cred -ne $null) {
    $u = $cred.GetNetworkCredential().UserName
    $p = $cred.GetNetworkCredential().Password
}


if ($Action -eq "import") {

    foreach ($file in Get-ChildItem -Path $DestFolder -Filter *.json) {
        $Collection = [System.IO.Path]::GetFileNameWithoutExtension($file.name);
        Write-Host "Importing $file in Collection $Collection ..."

        [console]::ForegroundColor = "DarkGray"
        Start-Process -FilePath ($MongoToolsFolder + $ImportExec) -NoNewWindow -Wait `
            -ArgumentList ("/host:$HostName /port:$Port /username:$u /password:$p /db:$DBName /collection:$Collection " + $file.FullName)
        [console]::ForegroundColor = "Gray"
    }
    
    Write-Host "`r`nImport process just finished."
}
elseif ($Action -eq "export") {
   
    $CollectionsList = GetCollections -User $u -Password $p
    Write-Host ($CollectionsList.length.ToString() + " collections found in database $DBName.")

    foreach ($col in $CollectionsList) {
        Write-Host "Exporting ""$col"" to ""$DestFolder\$col.json"" ..."
        
        [console]::ForegroundColor = "DarkGray"
        Start-Process -FilePath ($MongoToolsFolder + $ExportExec) -NoNewWindow -Wait `
            -ArgumentList ("/host:$HostName /port:$Port /username:$u /password:$p /db:$DBName /collection:$col /out:$DestFolder\$col.json")
        [console]::ForegroundColor = "Gray"
    }

    Write-Host "`r`nExport process finished."
}
else {
    Throw "The ""Action"" parameter has an invalid value. Current value: ""$Action"". Valid Values: ""import"", ""export"""
}

Write-Host("`r`n`r`nPress any key to exit.") 
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null