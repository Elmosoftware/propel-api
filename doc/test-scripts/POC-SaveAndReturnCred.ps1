<#
    POC script that creates and return credentials saved in the Password vaul

#>

#region External Modules
	
try
{
    [Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime] | Out-Null
}
catch
{
	Throw ("There was an exception trying to load 'Windows.Security.Credentials.PasswordVault'. " +	
        "Following error details: [" + $_.Exception.GetType().FullName + "]: " + $_.Exception.Message)
}

#endregion


"Creating the PasswordVault instance..."
$vault = New-Object Windows.Security.Credentials.PasswordVault

"Adding 1st credential to the vault"
$credFirst = New-Object windows.Security.Credentials.PasswordCredential
$credFirst.UserName = 'PropelTest'
$credFirst.Resource = "000"
$credFirst.Password = "Pass"

try {
    $vault.Retrieve($credFirst.Resource, $credFirst.UserName) | Out-Null
    "1st credential exists!"
}
catch {
    if($_.Exception.Message.ToLower().Contains("element not found")) {
        "Credential 000 NOT FOUND, adding it to the credential vault..."
        $vault.Add($credFirst)
    }
    else {
        ("ANOTHER ERROR: " +  $_.Exception.Message)
    }
}

"Adding 2nd credential to the vault"
$credSecond = New-Object windows.Security.Credentials.PasswordCredential
$credSecond.UserName = 'PropelTest'
$credSecond.Resource = [datetime]::Now.ToString()
$credSecond.Password = "Pass2"
$vault.Add($credSecond)

"Retrieving all Test credentials:"
#$retrievedCred = $vault.FindAllByResource($cred.Resource)
$allCreds = @()

$vault.Retrieveall() | Where-Object { $_.UserName.StartsWith("Propel")} | ForEach-Object {

    $_.RetrievePassword()  #This is going to fetch the password in clear text and store it in the "Password" attribute.
    
    $allCreds += [pscustomobject]@{ `
        "User Name" = $_.UserName; 
	    "Resource" = $_.Resource; 
        "Pass" = $_.Password; 
        } 
} 

return $allCreds | ConvertTo-Json -Compress