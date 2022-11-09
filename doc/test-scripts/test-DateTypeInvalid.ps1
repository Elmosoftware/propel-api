
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='This is considered an invalid Datatime value for Propel. All dates must be in ISO-8601 format.')]
    [datetime]$DateInvalid = "1/1/2022"
)
#endregion

Write-Host "`r`nDone!"