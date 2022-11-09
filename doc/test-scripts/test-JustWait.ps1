<#
    Just wait for the specified time.
#>

#region Script Parameters
param (
    [Parameter(Mandatory=$true, HelpMessage='Allows to set the waiting time.')]
    [ValidateNotNullOrEmpty()]
    [int]$DurationSeconds = 3
)

Write-Output "Waiting for $DurationSeconds seconds ..."
Start-Sleep -Seconds $DurationSeconds
Write-Output "Waiting is done, finishing the execution."
