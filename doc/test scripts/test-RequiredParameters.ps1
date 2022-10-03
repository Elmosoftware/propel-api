
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
    Minimal call for this script have top had all the parameters with at least following values:
    .\test-requiredparameters 
        -IntegerParam:$null #Note: In numeric values, $null is converted to 0.
        -SwitchParam:$null 
        -BooleanParam:$true #Note: Booleans can't be null.
        -StringParam:" " #Note: Strings can't be empty.
        -DoubleParam:$null 
        -DatetimeParam:"2022-07-12" #Note: Datetime can't accept any null value
        -ArrayStringParam:@(" ") #Note: String Arrays must have at least one element different than "".
        -ArrayIntParam:@(0) #Note: Numeric arrays must have at least one element
        -HashTableParam:@{} #Note: Hastables can be empty.
#>

#region Script Parameters
param (
    [Parameter(Mandatory=$true, HelpMessage='Required int32 parameter.')]
    [int]$IntegerParam,

    [Parameter(Mandatory=$true, HelpMessage='Required switch parameter.')]
    [switch]$SwitchParam,

    [Parameter(Mandatory=$true, HelpMessage='Required boolean parameter.')]
    [boolean]$BooleanParam,

    [Parameter(Mandatory=$true, HelpMessage='Required string parameter.')]
    [string]$StringParam,

    [Parameter(Mandatory=$true, HelpMessage='Required double parameter.')]
    [double]$DoubleParam,
    
    [Parameter(Mandatory=$true, HelpMessage='Required dateTime parameter')]
    [DateTime]$DatetimeParam,

    [Parameter(Mandatory=$true, HelpMessage='Required string array parameter.')]
    [string[]]$ArrayStringParam,

    [Parameter(Mandatory=$true, HelpMessage='Required numeric array parameter.')]
    [int[]]$ArrayIntParam,
    
    [Parameter(Mandatory=$true, HelpMessage='Required hashtable param.')]
    [hashtable]$HashTableParam
)
#endregion

#region Script Body

Write-Host "Parameters values:`r`n==========================================="
"IntegerParam:"
$IntegerParam
"IntegerParam is Null?:"
$IntegerParam -eq $null
"SwitchParam:"
$SwitchParam
"SwitchParam is Null?:"
$SwitchParam -eq $null
"StringParam:"
$StringParam
"StringParam is Null?:"
$StringParam -eq $null
"DoubleParam:"
$DoubleParam
"DoubleParam is Null?:"
$DoubleParam -eq $null
"DatetimeParam:"
$DatetimeParam
"DatetimeParam is Null?:"
$DatetimeParam -eq $null
"ArrayStringParam:"
$ArrayStringParam
"ArrayStringParam is Null?:"
$ArrayStringParam -eq $null
"ArrayIntParam:"
$ArrayIntParam
"ArrayIntParam is Null?:"
$ArrayIntParam -eq $null
"HashTableParam:"
$HashTableParam
"HashTableParam is Null?:"
$HashTableParam -eq $null

Write-Host "`r`nDONE!!!!`r`n==========================================="


#endregion
