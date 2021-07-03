$Propel2 = New-Object -TypeName PsCustomObject | `
    Add-member -Name TargetFQDN -MemberType ScriptProperty -PassThru -Value { "TargetFQDNValue" } | `
    Add-member -Name TargetName -MemberType ScriptProperty -PassThru -Value { "TargetNameValue" } | `
    Add-member -Name LogName -MemberType ScriptProperty -PassThru -Value { "LogNameValue" } | `
    Add-member -Name LogSource -MemberType ScriptProperty -PassThru -Value { "LogSourceValue" } | `
    Add-member -Name LogLevel -MemberType ScriptProperty -PassThru -Value { "LogLevelValue" } | `
    Add-member -Name ImpersonateEnabled -MemberType ScriptProperty -PassThru -Value { $true } | `
    Add-member -Name ImpersonateCredentials -MemberType ScriptProperty -PassThru -Value { New-Object System.Management.Automation.PSCredential "Cacoo\Cacatua", (ConvertTo-SecureString "pass" -AsPlainText -Force) };

#SET-VARIABLE PropelForce -Option Constant -Value 999 -Force -Description "Propel public variables. You can use this on your scripts!"

<#SET-VARIABLE Propel -Option Constant -Value ([pscustomobject]@{ `
    "TargetFQDN" = "TargetFQDNValue";
    "TargetName" = "TargetNameValue";
    "LogName" = "LogNameValue";
    "LogSource" = "LogSourceValue";
    "LogLevel" = "LogLevelValue";
    "ImpersonateEnabled" = $true;
    "ImpersonateCredentials" = New-Object System.Management.Automation.PSCredential "Cacoo\Cacatua", (ConvertTo-SecureString "pass" -AsPlainText -Force);
    }) -Force -Description "Propel public variables. You can use this on your scripts!"
    #>