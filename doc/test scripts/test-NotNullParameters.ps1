
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='Not required int32 parameter.')]
    [ValidateNotNull()]
    [int]$IntegerParam,

    [Parameter(HelpMessage='Not Required swithc parameter.')]
    [ValidateNotNull()]
    [switch]$SwitchParam,

    [Parameter(HelpMessage='Not required boolean parameter.')]
    [ValidateNotNull()]
    [boolean]$BooleanParam,

    [Parameter(HelpMessage='Not required string parameter.')]
    [ValidateNotNull()]
    [string]$StringParam,

    [Parameter(HelpMessage='Not required double parameter.')]
    [ValidateNotNull()]
    [double]$DoubleParam,
    
    [Parameter(HelpMessage='Not required dateTime parameter')]
    [ValidateNotNull()]
    [DateTime]$DatetimeParam,

    [Parameter(HelpMessage='Not required string array parameter.')]
    [ValidateNotNull()]
    [string[]]$ArrayStringParam,

    [Parameter(HelpMessage='Not required numeric array parameter.')]
    [ValidateNotNull()]
    [int[]]$ArrayIntParam,
    
    [Parameter(HelpMessage='Not required hashtable param.')]
    [ValidateNotNull()]
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
