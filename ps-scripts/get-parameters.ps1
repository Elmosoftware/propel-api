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

Write-Output "Starting script execution ..." 
Write-Output "Parameters:"
Write-Output "Path: ""$path"""


(get-command $Path).ParameterSets.Parameters | ForEach-Object -Process {

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

    if($sysParams -notcontains $_.name) {
        $results += ([pscustomobject]@{ `
            Position = $_.Position; `
            Name = $_.name; `
            HelpMessage = $_.HelpMessage; `
            ParameterType = $_.ParameterType.FullName; `
            IsMandatory = $_.IsMandatory; `
            ValidValues = $validValues; `
            CanBeNull = $canBeNull; `
            CanBeEmpty = $canBeEmpty; `
            })
    }
}

Write-Output ($results.length.ToString() + " parameter(s) found") 

return $results | ConvertTo-Json -Compress

#endregion




