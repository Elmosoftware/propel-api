
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='Date without time.')]
    [datetime]$DateOnlyISO = "2022-09-12",
    [Parameter(HelpMessage='Date with time.')]
    [datetime]$DateAndTimeISO = "2022-09-12T13:41:23.456",
    [Parameter(HelpMessage='Date with UTC time.')]
    [datetime]$DateAndTimeISOUTC = "2022-09-12T13:41:23.456Z",
    [Parameter(HelpMessage='Date without default value.')]
    [datetime]$DateAndTimeNoDefault,
    [Parameter(Mandatory=$true, HelpMessage='Required Date with no default value.')]
    [datetime]$RequiredDateWithNoDefaultValue,
    [Parameter(Mandatory=$true, HelpMessage='Required Date with default value.')]
    [datetime]$RequiredDateWithDefaultValue = "2022-09-12T17:01"
)
#endregion

Write-Host "Parameter values:`r`n==========================================="
"DateOnlyISO:"
$DateOnlyISO
"DateAndTimeISO:"
$DateAndTimeISO
"DateAndTimeISOUTC:"
$DateAndTimeISOUTC
"DateAndTimeNoDefault:"
$DateAndTimeNoDefault
"DateAndTimeNoDefault is null?:"
$null -eq $DateAndTimeNoDefault
"RequiredDateWithNoDefaultValue:"
$RequiredDateWithNoDefaultValue
"RequiredDateWithDefaultValue:"
$RequiredDateWithDefaultValue

Write-Host "`r`nDone!"