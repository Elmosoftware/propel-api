#region Script Parameters
param (
    [Parameter(HelpMessage='Initial Mandatory Parameter.')]
    [string]$Initial
)
#endregion

return [pscustomobject]@{ `
	    "`$Initial" = $Initial; 
        } | ConvertTo-Json -Compress

#endregion

