<##################################################################################
                               PROPEL UNINSTALLER
###################################################################################>
param (
		[Parameter(Mandatory = $false, HelpMessage="Indicates if any user confirmation will be required.")]
		[switch] $Unattended	
)

Import-Module -Name ".\util.psm1" -Prefix "Util." 

$cfg = Util.GetConfig

if($Unattended -eq $false) {
    Util.PrintTitle -Text "Propel Uninstaller"
    Util.Msg "Uninstaller configuration:"
    $cfg | Format-List *
}

#region Private Methods


#endregion

[console]::ForegroundColor = "White"

if((Util.AppIsInstalled) -eq $true) {

    Util.Msg "Installing node-windows ..."

    if((Util.InstallNodeWindows) -gt 0) {
        Util.ExitByPressingKey "There was an error during installation. The process can not continue." -Unattended:$Unattended
    }
    
    Util.msg "Uninstalling propel service ..."

    if((Util.uninstallpropelservice) -gt 0) {
        Util.ExitByPressingKey "there was an error uninstalling propel service. the process can not continue." -Unattended:$Unattended
    }

    Util.Msg "Deleting files in destination folder ..."
    Remove-Item -Path $cfg.installationFolder -Recurse -Force

}
else {
    Util.ExitByPressingKey -Msg ("The installation folder """ + $cfg.installationFolder + """ wasn't found. No need to continue.") -Unattended:$Unattended
}

Util.Msg "Uninstalling Propel application..."
Util.UninstallShell

Util.ExitByPressingKey -Msg "Uninstall process is now finished." -Unattended:$Unattended
