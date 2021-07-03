#region Script Parameters
param (
    [Parameter(HelpMessage='Sample script parameter.')]
    [string[]]$MyParameter,
    $Propel #<--- Here the $Propel parameter
)
#endregion

#####################################
#Only for testing purposes, below you can set the values you want:
$Propel = [pscustomobject]@{ `
	    Environment = "development"; `
	    ImpersonateEnabled = $true; `
        ImpersonateCredentials = (New-Object System.Management.Automation.PSCredential "MyDomain\MyUser", `
          (ConvertTo-SecureString "My password" -AsPlainText -Force)); `
        } 
#####################################

#Checking the propel variable value
$Propel | Select Environment, ImpersonateEnabled, `
    @{Name="ImpersonateCredentials.User";Expression={$_.ImpersonateCredentials.GetNetworkCredential().UserName}} | Format-List *

$Propel.ImpersonateCredentials.GetNetworkCredential()