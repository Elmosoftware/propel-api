<#
.SYNOPSIS
  Testing of Propel Credentials
.DESCRIPTION
  The only objective here is to test the data passed to a script by Propel in the $PropelCredentials parameter
.INPUTS
  None.
.OUTPUTS
  JSON format output.
.NOTES
  Version:        1.0.0
  Author:         JC
  Creation Date:  09/21/2021
  Purpose/Change: 
  ==========================================
  Version:        1.0.1
  Author:         JC
  Creation Date:  11/07/2022
  Purpose/Change: Refactor and enabling a way to show the password for testing purposes only.
#>

#region Script Parameters
param (
    [Parameter(HelpMessage = 'Select here any credentials you want to test. No sensitive data will be displayed.')]
    $PropelCredentials
)
#endregion

#region External Modules
<#
    Recall that any module added here need to exist on remote server.
#>
#endregion

#region Private Methods

function GetSensitiveValue() {
    param(
        [string]$Value
    )

    if ($ShowSensitiveValues -eq $false) {
        if ([String]::IsNullOrEmpty($Value) -eq $true) {
            $Value = "Has no value set"
        }
        else {
            if ($Value.Length -lt 8) {
                $Value = "..."
            }
            else {
                #If the value is longer than 8 chars, we are showing the last 3 of them:
                $Value = "..." + $Value.Substring($Value.Length - 3, 3)
            }
        }
    }
    
    return $Value
}

#endregion

$results = @();
$JSONrepl = @(
    @( "{", ""),
    @( "}", ""),
    @( """", ""),
    @( ":", "="),
    @( ",", ", ")
)

<#
IMPORTANT NOTE: Only for testing purposes set this value to $true to see the passwords 
and other sensitive values:
#>
$ShowSensitiveValues = $true

#================================================================
#DEBUG ONLY:
# $PropelCredentials = @(
#     [pscustomobject]@{
#         Name   = "TestCredWin";
#         Type   = "Windows";
#         Fields = [pscustomobject]@{
#             Field01 = "45";
#             Field02 = "My Field value";
#         };
#         cred   = (New-Object System.Management.Automation.PSCredential "DOMAIN\USER", 
#             (ConvertTo-SecureString "PASSWORD" -AsPlainText -Force));
#     }; , 
#     [pscustomobject]@{
#         Name      = "TestCredAWS";
#         Type      = "AWS";
#         Fields    = [pscustomobject]@{
#             FieldAWS01 = "AWS Value";
#         };
#         AccessKey = "AccessKEY";
#         SecretKey = "";
#     }; , 
#     [pscustomobject]@{
#         Name   = "TestCredAPI";
#         Type   = "APIKey";
#         Fields = [pscustomobject]@{
#             FielAPI01 = "API Value";
#         };
#         AppId  = "APPID";
#         APIKey = "APIKEYVERYLONGERTOSHOWALLOFIT";
#     };
# )
#================================================================

if ($null -ne $PropelCredentials) {
    $PropelCredentials | ForEach-Object -Process { 

        $credential = $_
        $fields = $credential.Fields | ConvertTo-Json -Compress
        $credentialSecret = ""

        $JSONrepl | ForEach-Object -Process { 
            $fields = $fields -replace $_[0], $_[1]
        }

        switch ($credential.Type) {
            "Windows" {
                $cred = $credential.cred.GetNetworkCredential()
                $credentialSecret = "UserName={0}, Password={1}" -f 
                    $cred.UserName, 
                    (GetSensitiveValue -Value $cred.Password)
                break
            }
            "AWS" {
                $credentialSecret = "Access Key={0}, Secret Key={1}" -f 
                    (GetSensitiveValue -Value $credential.AccessKey), 
                    (GetSensitiveValue -Value $credential.SecretKey)
                break
            }
            "APIKey" {
                $credentialSecret = "App ID={0}, API Key={1}" -f 
                    (GetSensitiveValue -Value $credential.AppId), 
                    (GetSensitiveValue -Value $credential.APIKey)
                break
            }
            Default {
                $credentialSecret = "The credential type ""$_"" is not supported by this script."
            }
        }

        $results += ([pscustomobject]@{ `
                    "Name" = $credential.Name
                "Type"     = $credential.Type
                "Fields"   = $fields
                "Secret"   = $credentialSecret
            })
    }    
}
else {
    return "No Credentials were provided."
}

return $results | ConvertTo-Json -Compress