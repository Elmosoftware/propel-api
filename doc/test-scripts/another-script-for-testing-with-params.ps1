<#
    Testing script

#>

param (
    [Parameter(HelpMessage='Sample text parameter not mandatory.')]
    [string]$SampleText = "Default text value"
)

#region External Modules
	
#endregion


"Creating the results..."

$results += [pscustomobject]@{ `
    "Value 1" = 1; 
    "Time" = [Datetime]::Now; 
    "Sample Text" = $SampleText
} 

Write-Output "Waiting ..."
Start-Sleep -Seconds 2

return $results | ConvertTo-Json -Compress