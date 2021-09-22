<#
    POC script that creates and return credentials saved in the Password vaul

#>

#region External Modules
	
#endregion


"Creating the results..."

$results += [pscustomobject]@{ `
    "Value 1" = 1; 
    "Time" = [Datetime]::Now; 
} 

Write-Output "Waiting ..."
Start-Sleep -Seconds 2

return $results | ConvertTo-Json -Compress