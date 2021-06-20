<##################################################################################
                        PROPEL INSTALLATION SHARED MODULE
###################################################################################>


$cfg = [pscustomobject]@{ `
	    "installationFolder" = "C:\Propel"; 
        "installerFolder" = (Get-Location).Path;
        "APIFolder" = "propel-api";
        "APIConfigFile" = ".env";
        "shellFolder" = "propel-shell";
        "shellProgramFilesFolder" = "Propel";
        "shellUninstaller" = "Uninstall Propel.exe";
        "serviceName" = "propel.exe";
        "defaultSvcAccount" = "NT AUTHORITY\NETWORK SERVICE"
        } 


#===============================================================================
# Private Methods:
#===============================================================================


#===============================================================================
# Public Methods:
#===============================================================================

function PrintTitle() {
    param (
		[Parameter(Mandatory = $true)]
		[string] $Text
	)

    $width = 80

    if($Text.Length -gt $width) {
        $Text = $Text.Substring(0, $width)
    }

    $pad = $width - $Text.Length
	Write-Host "`r`n"
    Write-Host "".PadLeft($width, "=")
    Write-Host $Text.PadLeft($pad/2, " ")
    Write-Host "".PadLeft($width, "=")
    Write-Host "`r`n`r`n"
}
Export-ModuleMember -Function "PrintTitle"

function GetConfig() {
	Return $cfg
}
Export-ModuleMember -Function "GetConfig"


function ExitByPressingKey() {
param (
		[Parameter(Mandatory = $true)]
		[string] $Msg,
        [switch] $Unattended	
	)

    Write-Host($Msg) 
    
    if($Unattended -eq $false) {
        Write-Host("`r`n`r`nPress any key to exit.") 
        $host.ui.rawuI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    }

    exit
}
Export-ModuleMember -Function "ExitByPressingKey"


function GrantFullControl() {
param (
		[Parameter(Mandatory = $true)]
		[string] $Path,
		[Parameter(Mandatory = $true)]
		[string] $User	
	)

    $acl = Get-Acl $Path    
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($User, "FullControl", "ContainerInherit, ObjectInherit", "None", "Allow")
    $acl.AddAccessRule($accessRule)
    Set-Acl -aclobject $acl $Path
}
Export-ModuleMember -Function "GrantFullControl"

function Msg($text){
    Write-Host("`r`n$text`r`n") 
}
Export-ModuleMember -Function "Msg"

function Dialog(){
    param (
		[Parameter(Mandatory = $true)]
		[string] $Text,
        [Parameter(Mandatory = $false)]
        [string] $Caption,
        [Parameter(Mandatory = $false)]
        [ValidateSet("AbortRetryIgnore","OK", "OKCancel", "RetryCancel", "YesNo", "YesNoCancel")]
        [string] $Buttons = "OK",
        [Parameter(Mandatory = $false)]
        [ValidateSet("Asterisk","Error", "Exclamation", "Hand", "Information", "None", "Question", "Stop", "Warning")]
        [string] $Icon
    )
    
    try {
        [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
    }
    catch {
    }
    
    if([String]::IsNullOrEmpty($Caption)) {
        $Caption = ""
    }

    if([String]::IsNullOrEmpty($Buttons)) {
        $Buttons = "OK"
    }

    if([String]::IsNullOrEmpty($Icon)) {
        $Icon = "Information"
    }

    return ([System.Windows.Forms.MessageBox]::Show($Text, $Caption, $Buttons, $Icon))
}
Export-ModuleMember -Function "Dialog"

function AppIsInstalled() {
    #Checking Installation folder
    return (Test-Path -Path ($cfg.installationFolder + "/" + $cfg.APIFolder));
}
Export-ModuleMember -Function "AppIsInstalled"

function InstallNodeWindows() {
    #Changing working dir to the installation folder:
    Set-Location -Path ($cfg.installationFolder + "\" + $cfg.APIFolder)

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "npm"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "install node-windows"

    #Changing the working directory back to the installer folder:
    Set-Location -Path $cfg.installerFolder
    [console]::ForegroundColor = "White"

    if($LASTEXITCODE -gt 0) {
        return $LASTEXITCODE
    }
}
Export-ModuleMember -Function "InstallNodeWindows"

function UninstallPropelService() {
    #Changing working dir to the API folder:
    Set-Location -Path ($cfg.installationFolder + "\" + $cfg.APIFolder)

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "node"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "service-uninstall.js"
    [console]::ForegroundColor = "White"

    $code = $LASTEXITCODE    
    #Changing back to the installer folder:
    Set-Location -Path $cfg.installerFolder

    return $code
}
Export-ModuleMember -Function "UninstallPropelService"

function InstallPropelService() {
    #Changing working dir to the API folder:
    Set-Location -Path ($cfg.installationFolder + "\" + $cfg.APIFolder)
    
    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "node"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "service-install.js"
    $code = $LASTEXITCODE 
    #Changing back to the installer folder:
    Set-Location -Path $cfg.installerFolder
    [console]::ForegroundColor = "White"

    return $code
}
Export-ModuleMember -Function "InstallPropelService"

function SetPropelServiceCredentials() {
    $service = $null;
    $user = ""
    $cred = $null

    [console]::ForegroundColor = "DarkGray"   

    try {
        $cred = (Get-Credential).GetNetworkCredential()
    }
    catch {
    }

    #If no credentials were provided, we need to assign the default ones:
    if($cred -eq $null) {
        $cred = (New-Object System.Management.Automation.PSCredential $cfg.defaultSvcAccount, (new-object System.Security.SecureString)).GetNetworkCredential()
    }
    
    $service = Get-WMIObject -namespace "root\cimv2" -class Win32_Service -Filter ("Name='" + $cfg.serviceName + "'")

    if($service -ne $null) {
        if([String]::IsNullOrEmpty($cred.Domain)) {
            $user =  $cred.UserName
        }
        else {
            $user = $cred.Domain + "\" + $cred.UserName
        }

        Util.Msg ("Changing service to run with the following user: ""$user"".")
        $service.Change($null, $null, $null, $null, $null, $null, $user, $cred.Password, $null, $null, $null) | Out-Null

        Util.Msg "Stopping the service"
        $service.StopService() | Out-Null

        while ($service.Started) {
            Start-Sleep -Seconds 1
            $service = Get-WmiObject -namespace "root\cimv2" -class Win32_Service -Filter ("Name='" + $cfg.serviceName + "'")
        }

        Util.Msg "Starting the service"
        $service.StartService() | Out-Null
    }
    else {
        Util.Msg "SERVICE NOT FOUND. Please verify it was installed successfully."
    }        
    

    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}
Export-ModuleMember -Function "SetPropelServiceCredentials"

function ImpersonateOptions() {

    $cred = $null
    $envFile = ($cfg.installationFolder + "\" + $cfg.APIFolder + "\" + $cfg.APIConfigFile);
    $textDialog = @'
Following you can define which credentials Propel is going to use to execute remote scripts. 
If you select "Yes" you will be prompted to enter the user and password.
If you select "No" Propel is going to use the same credentials used to run the Propel Service.

Do you want to enter specific credentials to execute remote scripts?
'@
    $replaceList = @(   
     @{ SearchFor = "{#IMPERSONATE}"; 
        ReplaceBy = "false" },
    @{ SearchFor = "{#IMPERSONATE_USER}"; 
        ReplaceBy = "" },
    @{ SearchFor = "{#IMPERSONATE_DOMAIN}"; 
        ReplaceBy = "" },
    @{ SearchFor = "{#IMPERSONATE_PASSWORD}"; 
        ReplaceBy = "" }
    )
    
    [console]::ForegroundColor = "DarkGray"   

    $retDialog = (Util.Dialog -Text $textDialog -Caption "Remote script invocation credentials" -Buttons "YesNo" -Icon "Question")

    if($retDialog -eq "Yes") {
        try {
            $cred = (Get-Credential).GetNetworkCredential()
        }
        catch {
        }
    }

    #If some credentials were provided:
    if($cred -ne $null) {
        $replaceList[0].ReplaceBy = "true"
        $replaceList[1].ReplaceBy = $cred.UserName
        $replaceList[2].ReplaceBy = $cred.Domain
        $replaceList[3].ReplaceBy = $cred.Password
        Util.Msg ("Option selected: Invoke remote commands as user """ + $cred.UserName + """.")
    }
    else {
        Util.Msg ("Option selected: Invoke remote commands using Propel Service credentials.")
    }

    #Getting the content and replacing:
    Util.Msg ("Reading config file: ""$envFile"".")
    [string]$content = [String]::Join("`r`n", (Get-Content $envFile))

    $replaceList | ForEach-Object {
        $content = $content.Replace($_.SearchFor, $_.ReplaceBy)
    }

    #Writing the modified config file:
    Util.Msg ("Updating config file: ""$envFile"".")
    $content | Out-File $envFile -Encoding "ASCII" -Force
    
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}
Export-ModuleMember -Function "ImpersonateOptions"

function InstallPackages() {

    [console]::ForegroundColor = "DarkGray"  
    #Changing working dir to the API folder:
    Set-Location -Path ($cfg.installationFolder + "\" + $cfg.APIFolder)  
    Start-Process -FilePath "npm"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "install"
    $code = $LASTEXITCODE   
    #Changing back to the installer folder:
    Set-Location -Path $cfg.installerFolder
    [console]::ForegroundColor = "White"

    return $code
}
Export-ModuleMember -Function "InstallPackages"

function InstallShell() {

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath ($cfg.InstallerFolder + "\" + $cfg.ShellFolder + "\setup.exe") `
        -Wait `
        -NoNewWindow
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}
Export-ModuleMember -Function "InstallShell"

function UninstallShell() {

    $uninstaller = ($env:ProgramFiles + "\" + $cfg.shellProgramFilesFolder + "\" + $cfg.shellUninstaller)

    [console]::ForegroundColor = "DarkGray"    

    if((Test-Path -Path $uninstaller) -eq $true) {
        Start-Process -FilePath $uninstaller `
            -Wait `
            -NoNewWindow
    }
    else {
        Msg "Propel application uninstaller was not found.This probably means the application was already uninstalled"
    }
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}
Export-ModuleMember -Function "UninstallShell"

function DBMigration() {

    Get-Childitem -Path $cfg.installerFolder -Filter "*.js" | `
        Sort Name | `
        ForEach-Object -Process {
        
        [console]::ForegroundColor = "DarkGray"    
        Start-Process -FilePath "mongo"`
            -Wait `
            -NoNewWindow `
            -ArgumentList $_.Name
        [console]::ForegroundColor = "White"
	}    

    return $LASTEXITCODE    
}
Export-ModuleMember -Function "DBMigration"