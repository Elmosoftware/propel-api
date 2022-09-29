
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='Date without time in ISO-8601 format.')]
    [datetime]$DateOnlyISO = "2022-09-12",
    [Parameter(HelpMessage='Date without time in US locale format.')]
    [datetime]$DateOnlyUS = "9/12/2022"
)
#endregion

Write-Host "Parameters values:`r`n==========================================="
"DateOnlyISO:"
$DateOnlyISO
"DateOnlyUS:"
$DateOnlyUS

Write-Host "`r`nDone!"