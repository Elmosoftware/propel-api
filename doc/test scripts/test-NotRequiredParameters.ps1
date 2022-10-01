
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='Not required int32 parameter.')]
    [int]$IntegerParam,

    [Parameter(HelpMessage='Not Required swithc parameter.')]
    [switch]$SwitchParam,

    [Parameter(HelpMessage='Not required boolean parameter.')]
    [boolean]$BooleanParam,

    [Parameter(HelpMessage='Not required string parameter.')]
    [string]$StringParam,

    [Parameter(HelpMessage='Not required double parameter.')]
    [double]$DoubleParam,
    
    [Parameter(HelpMessage='Not required dateTime parameter')]
    [DateTime]$DatetimeParam,

    [Parameter(HelpMessage='Not required string array parameter.')]
    [string[]]$ArrayStringParam,

    [Parameter(HelpMessage='Not required numeric array parameter.')]
    [int[]]$ArrayIntParam,
    
    [Parameter(HelpMessage='Not required hashtable param.')]
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
