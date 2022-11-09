
#region Script Parameters
#endregion

<#
    This is used for regression test.
#>

$results = [pscustomobject]@{ `
	    "User Domain" = $env:USERDOMAIN; `
	    "User Name" = $env:USERNAME; `
        "Host Name" = $env:COMPUTERNAME; `
        } 


return $results | ConvertTo-Json -Compress