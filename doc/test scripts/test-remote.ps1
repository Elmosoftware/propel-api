
#region Script Parameters
#endregion

#region External Modules
<#
    Recall that any module added here need to exist on remote server.
#>
#endregion

#region Private Methods

#endregion


$results = [pscustomobject]@{ `
	    "User Domain" = $env:USERDOMAIN; `
	    "User Name" = $env:USERNAME; `
        "Host Name" = $env:COMPUTERNAME; `
        } 


return $results | ConvertTo-Json -Compress