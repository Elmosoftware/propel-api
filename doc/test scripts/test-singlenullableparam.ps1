#region Script Parameters
param (
    [Parameter(HelpMessage='Nullable and no Mandatory param.')]
    [string[]]$NullableNoMandatory,
    [Parameter(Mandatory=$true)]
    [int]$SecondParam
)
#endregion

return [pscustomobject]@{ `
        "Param Is null" = ($NullableNoMandatory -eq $null); 
	    "Param Value" = ($NullableNoMandatory -join ","); 
        } | ConvertTo-Json -Compress

#endregion

