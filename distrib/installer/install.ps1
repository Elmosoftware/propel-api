<##################################################################################
                               PROPEL INSTALLER
###################################################################################>

[console]::ForegroundColor = "White"
$installationFolder = "C:\Propel"

$installerFolder = (Get-Location).Path
$APIFolder = "propel-api"
$ShellFolder = "propel-shell"

#region Private Methods

function Msg($text){
    Write-Host("`r`n$text`r`n") 
}

function AppIsInstalled() {
    #Checking Installation folder
    return (Test-Path -Path "$installationFolder/$APIFolder");
}

function InstallNodeWindows() {

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "npm"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "install -g node-windows"
    [console]::ForegroundColor = "White"

    if($LASTEXITCODE -gt 0) {
        return $LASTEXITCODE
    }

    [console]::ForegroundColor = "DarkGray"
    Start-Process -FilePath "npm"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "link node-windows"
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}

function UninstallPropelService() {

    #Changing working dir to "DestinationFolder/propel-api" folder:
    Set-Location -Path "$installationFolder\$APIFolder"

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "node"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "service-uninstall.js"
    [console]::ForegroundColor = "White"

    $code = $LASTEXITCODE    
    #Changing back to the installer folder:
    Set-Location -Path $installerFolder

    return $code
}

function InstallPropelService() {
    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "node"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "service-install.js"
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}

function InstallPackages() {

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "npm"`
        -Wait `
        -NoNewWindow `
        -ArgumentList "install"
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}

function InstallShell() {

    [console]::ForegroundColor = "DarkGray"    
    Start-Process -FilePath "$InstallerFolder\$ShellFolder\setup.exe" `
        -Wait `
        -NoNewWindow
    [console]::ForegroundColor = "White"

    return $LASTEXITCODE    
}

function DBMigration() {

    Get-Childitem -Path $installerFolder -Filter "*.js" | `
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

function ExitByPressingKey($Msg) {
    Write-Host($Msg) 
    Write-Host("`r`n`r`nPress any key to exit.") 
    $host.ui.rawuI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    exit
}
#endregion

if((Test-Path -Path $installationFolder) -ne $true) {
    ExitByPressingKey "The installation folder ""$installationFolder"" wasn't found. Please create it before to retry."
}

#Installing node-Windows globally (npm install -g node-windows)
Msg "Installing node-windows component globally..."

if((InstallNodeWindows) -gt 0) {
    ExitByPressingKey "There was an error during installation. The process can not continue."
}

if((AppIsInstalled) -eq $true) {
    
    #Uninstalling the service
    Msg "Uninstalling Propel service, (if exists) ..."

    if((UninstallPropelService) -gt 0) {
        ExitByPressingKey "There was an error uninstalling Propel service. The process can's continue."
    }

    Msg "Deleting files in destination folder"
    Remove-Item -Path "$installationFolder\*" -Recurse -Force
}

#Apply database changes:
Msg "Applying database changes ..."
if((DBMigration) -gt 0) {
    ExitByPressingKey "There was an error migrating the database to last changes. The process can not continue."
}

#Copying distribution files to destination folder
Msg "Copying files to destination ..."
Copy-Item -Path "$installerFolder/*" -Destination $installationFolder -Recurse -Force

#Installing packages (npm install)
Msg "Installing packages..."
Set-Location -Path "$installationFolder/$APIFolder"

if((InstallPackages) -gt 0) {
    ExitByPressingKey "There was an error during packages installation. The process can not continue."
}

#Creating node-windows sym-link (npm link node-windows)

#Installing the service
Msg "Installing the service..."
if((InstallNodeWindows) -gt 0) {
    ExitByPressingKey "There was an error during installation. The process can not continue."
}

if((InstallPropelService) -gt 0) {
    ExitByPressingKey "There was an error during Propel Service installation. The process can not continue."
}

#Installing the Propel frontend app
Msg "Installing the Propel app..."
InstallShell

ExitByPressingKey "Installation process is now finished."

