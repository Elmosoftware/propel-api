#region Script Parameters
param (
    [Parameter(HelpMessage='Initial Mandatory Parameter.')]
    [string]$Initial,
    [Parameter(Mandatory=$true, HelpMessage='Now the parameter is mandatory and with no default value.')]
    [string]$Second
)
#endregion

return [pscustomobject]@{ `
	    "`$Initial" = $Initial; 
	    "`$Second" = $Second; 
        } | ConvertTo-Json -Compress

#endregion

