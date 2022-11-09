#region Script Parameters
param (
    [Parameter(HelpMessage='Initial Mandatory Parameter.')]
    [string]$Initial,
    [Parameter(HelpMessage='Added Parameter with default Value.')]
    [string]$Second = "Second parameter"
)
#endregion

return [pscustomobject]@{ `
	    "`$Initial" = $Initial; 
	    "`$Second" = $Second; 
        } | ConvertTo-Json -Compress

#endregion

