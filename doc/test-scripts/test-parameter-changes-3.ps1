#region Script Parameters
param (
    [Parameter(HelpMessage='Initial Mandatory Parameter.')]
    [string]$Initial,
    [Parameter(HelpMessage='Added Parameter but removing the default Value.')]
    [string]$Second
)
#endregion

return [pscustomobject]@{ `
	    "`$Initial" = $Initial; 
	    "`$Second" = $Second; 
        } | ConvertTo-Json -Compress

#endregion

