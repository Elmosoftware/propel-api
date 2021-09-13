param (
    $Param = @("Uno", "Dos")
)


"Value:"
$Param

"Is Null?:"
$Param -eq $null

"Type:"
$Param.GetType().FullName

<#
$x= @(
    [pscustomobject]@{ 
            cred = 23; 
            User = "This is Attr2";
            PassWord = "Pass 1";
            Fields = 2;
            },
    [pscustomobject]@{ 
            Attr1 = 24; 
            Attr2 = "This is Attr22";
            }
)



"X[0]:"
$x[0]
"X[1]:"
$x[1]
#>

<#
$x2= @(
    [pscustomobject]@{
    CredentialWindows = [pscustomobject]@{ 
        cred = "here the PScredential"; 
        User = "This is Attr2";
        PassWord = "Pass 1";
        Fields = [pscustomobject]@{
            Field1 = 1;
            Field2= "Caracuza" 
            };
        }
    },
    [pscustomobject]@{
    CredentialAWS = [pscustomobject]@{ 
        AccessKey = "This is Attr2";
        SecretKey = "Pass 1";
        Fields = [pscustomobject]@{
            Field1 = 1;
            Field2= "Caracuza" 
            };
        }
    }
)

"`r`nX2[0].CredentialWindows:"
$x2[0].CredentialWindows | format-table *

"`r`nx2[0].CredentialWindows.Fields:"
$x2[0].CredentialWindows.Fields | format-table *

"`r`nX2[1].CredentialWindows:"
$x2[1].CredentialAWS | format-table *

"`r`nx2[0].CredentialWindows.Fields:"
$x2[1].CredentialAWS.Fields | format-table *


#>

$x2= [pscustomobject]@{
    CredentialWindows = [pscustomobject]@{ 
        cred = "here the PScredential"; 
        User = "This is Attr2";
        PassWord = "Pass 1";
        Fields = [pscustomobject]@{
            Field1 = 1;
            Field2= "Caracuza" 
            };
        };
    CredentialAWS = [pscustomobject]@{ 
        AccessKey = "This is Attr2";
        SecretKey = "Pass 1";
        Fields = [pscustomobject]@{
            Field1 = 1;
            Field2= "Caracuza" 
            };
        }    
    }

"`r`nX2.CredentialWindows:"
$x2.CredentialWindows | format-table *

"`r`nx2.CredentialWindows.Fields:"
$x2.CredentialWindows.Fields | format-table *

"`r`nX2.CredentialWindows:"
$x2.CredentialAWS | format-table *

"`r`nx2.CredentialWindows.Fields:"
$x2.CredentialAWS.Fields | format-table *

