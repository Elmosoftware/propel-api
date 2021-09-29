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
        "defaultSvcAccount" = "NT AUTHORITY\LOCAL SERVICE";
        "MongoDBAdminUser" = "";
        "MongoDBAdminPassword" = "";
        "PropelApplicationUser" = "";
        "PropelApplicationPassword" = "";
        } 


#===============================================================================
# Private Methods:
#===============================================================================

function GetRandomPassword() {
    #We are excluding the following characters to avoid percent encoding the password in the MongoDB connectionstring:
    #    :  /  ?  #  [  ]  @
    return (("!$^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".tochararray() | sort {Get-Random})[0..8] -join '');
}


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

function StartingPropelService() {
    
    [console]::ForegroundColor = "DarkGray"    
    
    Util.Msg ("Trying to start service """ + $cfg.serviceName + """ ...");
    Start-Service $cfg.serviceName
    $code = $LASTEXITCODE 

    $svc = Get-Service $cfg.serviceName
    Util.Msg ("Current service status is: """ + $svc.Status + """.")
    
    [console]::ForegroundColor = "White"

    return $code
}
Export-ModuleMember -Function "StartingPropelService"

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

function ConfigurationOptions() {

    $LASTEXITCODE = 0

    try {

        $cred = $null
        $envFile = ($cfg.installationFolder + "\" + $cfg.APIFolder + "\" + $cfg.APIConfigFile);
    
        $replaceList = @(   
         @{ SearchFor = "{#DATABASE-CREDENTIALS}"; 
            ReplaceBy = ($cfg."PropelApplicationUser" + ":" + $cfg."PropelApplicationPassword") }
        )
    
        [console]::ForegroundColor = "DarkGray"   

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
    }
    catch{
        $LASTEXITCODE = 1
    }

    return $LASTEXITCODE    
}
Export-ModuleMember -Function "ConfigurationOptions"

function InstallPackages() {
    
    $LASTEXITCODE = 0

    try {
        [console]::ForegroundColor = "DarkGray"  
        #Changing working dir to the API folder:
        Set-Location -Path ($cfg.installationFolder + "\" + $cfg.APIFolder)
        $LASTEXITCODE = (Start-Process -FilePath "npm"`
            -Wait `
            -NoNewWindow `
            -PassThru `
            -ArgumentList "install").ExitCode   
        #Changing back to the installer folder:
        Set-Location -Path $cfg.installerFolder
        [console]::ForegroundColor = "White"
    }
    catch {
        $LASTEXITCODE = 1
    }

    return $LASTEXITCODE
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
      
    $cred = $null
    $evalParam = ""
    $textDialog = @'
In order to proceed with the database updates we need to authenticate in the Database with an administrator account.
If you select "Yes" you will be prompted to enter the user and password.
If you select "No" the installation process will be aborted.
'@   
    $retDialog = (Util.Dialog -Text $textDialog -Caption "MongoDB admin user credentials" -Buttons "YesNo" -Icon "Question")

    if($retDialog -eq "Yes") {
        try {
            $cred = (Get-Credential).GetNetworkCredential()
        }
        catch {
        }
    }
    else {
        Util.Msg ("Installer is now aborting...")
        return 1
    }

    #If some credentials were provided:
    if($cred -ne $null) {
        $cfg."MongoDBAdminUser" = $cred.UserName;
        $cfg."MongoDBAdminPassword" = $cred.Password;
    }
    else {
        Util.Msg ("No credentials were provided, installer is now aborting...")
        return 1
    }

    #Configuring now the Propel database application user, this one will be used by the Propel API to connect to the database.
    $cfg."PropelApplicationUser" = "PropelUser";
    $cfg."PropelApplicationPassword" = (GetRandomPassword);

    #Build the "eval" parameter of mongo:
    $evalParam = "--eval ""var adu= '" + ($cfg."MongoDBAdminUser").ToString() + "'; var adp= '" + ($cfg."MongoDBAdminPassword").ToString() + "'; var apu= '" + ($cfg."PropelApplicationUser").ToString() + "'; var app= '" + ($cfg."PropelApplicationPassword").ToString()  + "';""";

    $LASTEXITCODE = 0

    Get-Childitem -Path $cfg.installerFolder -Filter "*.js" | `
        Sort Name | `
        ForEach-Object -Process {

        if($LASTEXITCODE -eq 0) {
            Util.Msg ("Executing """ + $_.Name + """ ... -> " + ($LASTEXITCODE).ToString()) 
            [console]::ForegroundColor = "DarkGray"    
            $LASTEXITCODE = (Start-Process -FilePath "mongo" `
                -Wait `
                -NoNewWindow `
                -ArgumentList $evalParam, $_.Name `
                -PassThru).ExitCode
            [console]::ForegroundColor = "White"
            Util.Msg ("""" + $_.Name + """ returns exit code: " + ($LASTEXITCODE).ToString()) 
        }
        
	}    

    return $LASTEXITCODE 
}
Export-ModuleMember -Function "DBMigration"