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
if((Util.DBMigration) -ne 0) {
    Util.ExitByPressingKey "There was an error migrating the database to last changes. The process can not continue."
}

Util.Msg "Copying files to destination ..."
Copy-Item -Path ($cfg.installerFolder + "/*") -Destination $cfg.installationFolder -Recurse -Force

Util.Msg "Configuring Propel ..."
if((Util.ConfigurationOptions) -ne 0) {
    Util.ExitByPressingKey "There was an error while configuring Propel. The process can not continue."
}

Util.Msg "Installing API packages..."
if((Util.InstallAPIPackages) -ne 0) {
    Util.ExitByPressingKey "There was an error during packages installation. The process can not continue."
}

Util.Msg "Installing Shared packages..."
if((Util.InstallSharedPackages) -ne 0) {
    Util.ExitByPressingKey "There was an error during packages installation. The process can not continue."
}

Util.Msg "Installing Propel service..."
if((Util.InstallPropelService) -gt 0) {
    Util.ExitByPressingKey "There was an error during Propel Service installation. The process can not continue."
}

Util.Msg "Installing Propel application..."
Util.InstallShell

Util.Msg "Starting Propel service..."
if((Util.StartingPropelService) -gt 0) {
   Util.ExitByPressingKey "There was an error trying to start the Propel Service. The process can not continue."
}

Util.ExitByPressingKey "Installation process is now finished."
Stop-Transcript
