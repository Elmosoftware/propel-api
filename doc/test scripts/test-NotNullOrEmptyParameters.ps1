
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='Not required int32 parameter.')]
    [ValidateNotNullOrEmpty()]
    [int]$IntegerParam,

    [Parameter(HelpMessage='Not Required switch parameter.')]
    [ValidateNotNullOrEmpty()]
    [switch]$SwitchParam,

    [Parameter(HelpMessage='Not required boolean parameter.')]
    [ValidateNotNullOrEmpty()]
    [boolean]$BooleanParam,

    [Parameter(HelpMessage='Not required string parameter.')]
    [ValidateNotNullOrEmpty()]
    [string]$StringParam,

    [Parameter(HelpMessage='Not required double parameter.')]
    [ValidateNotNullOrEmpty()]
    [double]$DoubleParam,
    
    [Parameter(HelpMessage='Not required dateTime parameter')]
    [ValidateNotNullOrEmpty()]
    [DateTime]$DatetimeParam,

    [Parameter(HelpMessage='Not required string array parameter.')]
    [ValidateNotNullOrEmpty()]
    [string[]]$ArrayStringParam,

    [Parameter(HelpMessage='Not required numeric array parameter.')]
    [ValidateNotNullOrEmpty()]
    [int[]]$ArrayIntParam,
    
    [Parameter(HelpMessage='Not required hashtable param.')]
    [ValidateNotNullOrEmpty()]
    [hashtable]$HashTableParam
)
#endregion

#region Script Body

Write-Host "Parameters values:`r`n==========================================="
"IntegerParam:"
$IntegerParam
"SwitchParam:"
$SwitchParam
"StringParam:"
$StringParam
"DoubleParam:"
$DoubleParam
"DatetimeParam:"
$DatetimeParam
"ArrayStringParam:"
$ArrayStringParam
"ArrayIntParam:"
$ArrayIntParam
"HashTableParam:"
$HashTableParam

Write-Host "`r`nDONE!!!!`r`n==========================================="


#endregion
