<#
    Add in the following array the list of PowerShell process ids 
    that exists before to start the Propel API
#>
$otherIds =@()
#The below call is going to list the PowerShell Process created by the API:
Get-Process | Where-Object { $_.name -eq "powershell" -and -not $otherIds.Contains($_.Id) } 