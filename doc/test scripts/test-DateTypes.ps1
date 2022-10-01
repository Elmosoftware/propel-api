
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='Date without time in ISO-8601 format.')]
    [datetime]$DateOnlyISO = "2022-09-12",
    [Parameter(HelpMessage='Date without time in US locale format.')]
    [datetime]$DateOnlyUS = "9/12/2022",
    [Parameter(HelpMessage='Date with time in local timezone in ISO-8601 format.')]
    [datetime]$DateAndTimeISO = "2022-09-12T13:41:23.456",
    [Parameter(HelpMessage='Date with UTC time in ISO-8601 format.')]
    [datetime]$DateAndTimeISOUTC = "2022-09-12T13:41:23.456Z",
    [Parameter(HelpMessage='Date with time in US locale format.')]
    [datetime]$DateAndTimeUS = "9/12/2022 13:41:23.456",
    [Parameter(Mandatory=$true, HelpMessage='Required Date with no default value.')]
    [datetime]$DateWithNoDefaultValue,
    [Parameter(Mandatory=$true, HelpMessage='Required Date with default value.')]
    [datetime]$DateWithDefaultValue = "10/1/22"
)
#endregion

Write-Host "Parameters values:`r`n==========================================="
"DateOnlyISO:"
$DateOnlyISO
"DateOnlyUS:"
$DateOnlyUS
"DateAndTimeISO:"
$DateAndTimeISO
"DateAndTimeISOUTC:"
$DateAndTimeISOUTC
"DateAndTimeUS:"
$DateAndTimeUS
"DateWithNoDefaultValue:"
$DateWithNoDefaultValue

Write-Host "`r`nDone!"