
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameter
param (
    [Parameter(HelpMessage='Not Nullable int32 parameter.')]
    [ValidateNotNull()]
    [int]$IntegerParam,

    [Parameter(HelpMessage='Not Nullable swithc parameter.')]
    [ValidateNotNull()]
    [switch]$SwitchParam,

    [Parameter(HelpMessage='Not Nullable boolean parameter.')]
    [ValidateNotNull()]
    [boolean]$BooleanParam,

    [Parameter(HelpMessage='Not Nullable string parameter.')]
    [ValidateNotNull()]
    [string]$StringParam,

    [Parameter(HelpMessage='Not Nullable double parameter.')]
    [ValidateNotNull()]
    [double]$DoubleParam,
    
    [Parameter(HelpMessage='Not Nullable dateTime parameter')]
    [ValidateNotNull()]
    [DateTime]$DatetimeParam,

    [Parameter(HelpMessage='Not Nullable string array parameter.')]
    [ValidateNotNull()]
    [string[]]$ArrayStringParam,

    [Parameter(HelpMessage='Not Nullable numeric array parameter.')]
    [ValidateNotNull()]
    [int[]]$ArrayIntParam,
    
    [Parameter(HelpMessage='Not Nullable hashtable param.')]
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
