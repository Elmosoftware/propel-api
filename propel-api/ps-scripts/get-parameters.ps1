<#
	Retrieves an object array withall the information related to the specifies PowerShell script.
#>

#region Script Parameters
param (
    [Parameter(Mandatory = $true)]
    [string]$Path
)
#endregion

#region External Modules
<#
    Recall that any module added here need to exist on remote server.
#>

#endregion

#region Private Methods
	
#endregion

#region Private Members

$results = @()
	
#endregion

#region Public Methods

#endregion

#region Script Body

#Getting here all the parameters default values:
<#
    Credit to Adam Bertram about his work on a Powershell function to get parameters default values.
    https://github.com/adbertram/Random-PowerShell-Work/blob/master/PowerShell%20Internals/Get-FunctionDefaultParameter.ps1
#>
$defaultValues = `
    (Get-Command $Path).ScriptBlock.Ast.FindAll({ $args[0] -is [System.Management.Automation.Language.ParameterAst] }, $true) | `
        Where-Object { $_.DefaultValue } | `
        Select-Object @{ Name = 'name'; Expression = { $_.Name.VariablePath.UserPath } }, `
            @{ Name = 'value'; Expression = { if($_.DefaultValue.Value -or $_.StaticType.ToString() -eq "System.String"){ $_.DefaultValue.Value } else { $_.DefaultValue.Extent.Text } } }

#Extracting each parameter individually to get all the details:
(get-command $Path).ParameterSets.Parameters | Where-Object { $_.name -ne $null } | ForEach-Object -Process {

    $sysParams = @(
        "Verbose", 
        "Debug", 
        "ErrorAction", 
        "WarningAction", 
        "InformationAction", 
        "ErrorVariable", 
        "WarningVariable", 
        "InformationVariable", 
        "OutVariable", 
        "OutBuffer", 
        "PipelineVariable"
    )

    $canBeNull = $true
    $canBeEmpty = $true
    $validValues = @()
    $name = $_.name

    #If is not a PowerShell default system parameter:
    if($sysParams -notcontains $name) {

        $_.attributes.TypeId | ForEach-Object -Process {
            if($_.name -eq "ValidateNotNullAttribute") {
                $canBeNull = $false;
            }
            if($_.name -eq "ValidateNotNullOrEmptyAttribute") {
                $canBeNull = $false;
                $canBeEmpty = $false;
            }
        }

        if($_.attributes.ValidValues -ne $null) {
            $_.attributes.ValidValues | ForEach-Object -Process {
                $validValues += $_;
            }
        }

        $results += ([pscustomobject]@{ `
            Position = $_.Position; `
            Name = $_.name; `
            HelpMessage = $_.HelpMessage; `
            ParameterType = $_.ParameterType.FullName; `
            IsMandatory = $_.IsMandatory; `
            ValidValues = $validValues; `
            CanBeNull = $canBeNull; `
            CanBeEmpty = $canBeEmpty; `
            DefaultValue = ($defaultValues | Where-Object { $_.name -eq $name }).value `
            })
    }
}

return $results | ConvertTo-Json -Compress

#endregion