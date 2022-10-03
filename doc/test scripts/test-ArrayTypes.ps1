
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage='String Array.')]
    [string[]]$TypeStringArray = @("Hello", "World"),
    
    [Parameter(HelpMessage='String Array with validate set.')]
    [ValidateSet("First", "Second", "Third", "Fourth")]
    [string[]]$TypeStringArrayWithValidSet = @("First", "Second", "Non Existent"), #Adding a 
    #item not in the validset that will be removed by Propel when editing the values for 
    #a Workflow execution.

    [Parameter(HelpMessage='Numeric Array.')]
    [int[]]$TypeNumericArray = @(1, 2),

    [Parameter(HelpMessage='Propel Parameter here.')]
    $PropelCredentials,

    [Parameter(HelpMessage='Numeric Array with validate set.')]
    [ValidateSet(1, 2, 3, 4)]
    [int[]]$TypeNumericArrayWithValidSet = @(1, 2, 23), #Adding a item not in the validset that will be 
    #removed by Propel when editing the values for a Workflow execution. 
    
    [Parameter(HelpMessage='Object Array.')]
    $TypeObjectArray = @(@{One = 1; Two = 2}, @{Three = 3; Four = 4})
)
#endregion

Write-Host "Parameters values:`r`n==========================================="
"TypeStringArray:"
$TypeStringArray
"TypeStringArrayWithValidSet:"
$TypeStringArrayWithValidSet
"TypeNumericArray:"
$TypeNumericArray
"PropelCredentials:"
$PropelCredentials
"TypeNumericArrayWithValidSet:"
$TypeNumericArrayWithValidSet
"TypeObjectArray:"
$TypeObjectArray

Write-Host "`r`nDone!"