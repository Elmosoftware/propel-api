<##################################################################################
                               PROPEL INSTALLER
###################################################################################>

Import-Module -Name ".\util.psm1" -Prefix "Util." 

$cfg = Util.GetConfig
$logfile = ("install-log-" + ([DateTime]::Now).ToString("yyyyMMdd_HHmmss") + ".txt")

Start-Transcript -Path $logfile | Out-Null
Util.PrintTitle -Text "Propel Installation Process"

Util.Msg ("Log file:" + $logfile)
Util.Msg "Installer configuration:"
$cfg | Format-List *

#region Private Methods

#endregion

[console]::ForegroundColor = "White"

Util.Msg "Removing previous installation ... "
.\uninstall.ps1 -Unattended

Util.Msg "Creating installation folder ... "
New-Item -Path $cfg.installationFolder -ItemType Directory -Force | Out-Null
Util.GrantFullControl -Path $cfg.installationfolder -User $cfg.defaultSvcAccount

Util.Msg "Applying database changes ..."
if((Util.DBMigration) -gt 0) {
    Util.ExitByPressingKey "There was an error migrating the database to last changes. The process can not continue."
}

Util.Msg "Copying files to destination ..."
Copy-Item -Path ($cfg.installerFolder + "/*") -Destination $cfg.installationFolder -Recurse -Force

Util.Msg "Installing packages..."
if((Util.InstallPackages) -gt 0) {
    Util.ExitByPressingKey "There was an error during packages installation. The process can not continue."
}

Util.Msg "Installing Propel service..."
if((Util.InstallPropelService) -gt 0) {
    Util.ExitByPressingKey "There was an error during Propel Service installation. The process can not continue."
}

<# For the moment we are not changing the default account assigned to the service
Util.Msg "Following, you can set the log on credentials for the Propel Service."
Util.Msg ("If you close the following popup, no changes will be done to the service and it will run with the following default account:""" + $cfg.defaultSvcAccount + """.")
if((Util.SetPropelServiceCredentials) -gt 0) {
    Util.ExitByPressingKey "There was an error during Propel Service credential settings. The process can not continue."
}
#>

Util.Msg "Setting impersonation options... (Allowing using different credentials when invoking remote scripts)."
if((Util.ImpersonateOptions) -gt 0) {
    Util.ExitByPressingKey "There was an error while setting the impersonate options. The process can not continue."
}

Util.Msg "Installing Propel application..."
Util.InstallShell

Util.ExitByPressingKey "Installation process is now finished."
Stop-Transcript
