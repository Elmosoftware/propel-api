
<#
	This is a Testing script. You can configure duration plus other params to facilitate testing.
#>

#region Script Parameters
param (
    [Parameter(Mandatory=$true, HelpMessage='Allows to set the full duration of the execution.')]
    [ValidateNotNullOrEmpty()]
    [int]$DurationSeconds = 3,

    [Parameter(HelpMessage='Indicates if an error will be throw at the end of the execution.')]
    [switch]$ThrowError = $false,

    [Parameter(HelpMessage='Indicates if any message will be displayed.')]
    [boolean]$ShowMessages = $true,

    $Propel,

    [Parameter(Mandatory=$true, HelpMessage='Indicates if a text result will be send.Otherwise the result type will be JSONonly text results  any message will be displayed.')]
    [ValidateSet('Text','JSON')]
    [string]$ResultType,

    [Parameter(HelpMessage='If JSON type, this parameter allows to define how many results will be retrieved.')]
    [int]$TotalResults = 3,

    [Parameter(HelpMessage='Amount of columns to return in the case JSON results have been selected.')]
    [ValidateSet("1","2", "3", "4", "5", "6", "7", "8")]
    [string]$ColumnCount = "8",

    [Parameter(HelpMessage='ADDITIONAL TYPES: String.')]
    [string]$AdditionalTypesString = "Hello World!",

    [Parameter(HelpMessage='ADDITIONAL TYPES: String quoted.')]
    [string]$AdditionalTypesStringQuoted = """Hello World!""",
    
    [Parameter(HelpMessage='ADDITIONAL TYPES: Double.')]
    [double]$AdditionalTypesDouble = 1.1,
    
    [Parameter(HelpMessage='ADDITIONAL TYPES: DateTime')]
    [DateTime]$AdditionalTypesDatetime = "1/1/2020",

    [Parameter(HelpMessage='ADDITIONAL TYPES: String Array.')]
    [string[]]$AdditionalTypesStringArray = @("Hello", "World"),
    
    [Parameter(HelpMessage='ADDITIONAL TYPES: Numeric Array.')]
    [int[]]$AdditionalTypesNumericArray = @(1, 2, 3),
    
    [Parameter(HelpMessage='ADDITIONAL TYPES: Hash table.')]
    [hashtable]$AdditionalTypesHashTable = @{One = 1; Two = 2}
)
#endregion

#region External Modules
<#
	Recall that any module added here need to exist on remote server.
#>

#endregion

#region Private Methods
	
#endregion

#region Private Members
	
#endregion

#region Public Methods

#endregion

#region Script Body

$columnList = @( "Result Nbr", "Name", "Duration", "Longer Text", "Current Date", "This Machine", "Culture", "Date Time Format");

$longerText = @"
Donec adipiscing tristique risus nec feugiat in fermentum posuere. Vulputate ut pharetra sit amet. 
In hendrerit gravida rutrum quisque non tellus orci.
"@

if($ShowMessages -eq $true) {
    Write-Output "Starting script execution ..."

    "Supplied additional parameters:"
    "==================================="
    "Double:"
    $AdditionalTypesDouble
    "Datetime:"
    $AdditionalTypesDatetime
    "String:"
    $AdditionalTypesString
    "String quoted:"
    $AdditionalTypesStringQuoted
    "Array of String:"
    $AdditionalTypesStringArray | Format-List
    "Array of Numbers:"
    $AdditionalTypesNumericArray | Format-List
    "Hashtable:"
    $AdditionalTypesHashTable | Format-Table
    "Additional valid set example:"
    $AdditionalWithValidSet

    
    "Propel Variable:"
    "==================================="
    $Propel | Format-List *

    Write-Output "Waiting ..."
}

if($ThrowError) {
    throw "This error is from the script!"
}

if($ResultType -eq "JSON") {

    if($ShowMessages -eq $true) {
        Write-Output "Adding JSON results ..."
    }

    $results = @();
    for($i=1; $i -le $TotalResults; $i++) {
        $results += ([pscustomobject]@{ 
            "Result Nbr" = $i; 
            "Name" = "This is a name"; 
            "Duration" = $DurationSeconds; 
            "Longer Text" = $longerText; 
            "Current Date" = (Get-Date).ToString(); 
            "This Machine" = $Env:ComputerName; 
            "Culture" = (Get-Culture).NativeName;
            "Date Time Format" = (Get-Culture).DateTimeFormat.FullDateTimePattern;
            })
    }

    $columnList = ($columnList | Select -First $ColumnCount)
}
else {

    if($ShowMessages -eq $true) {
        Write-Output "Adding TEXT results ..."
    }

    $results = "This is a text result. plus a long text: $longerText"
}

Start-Sleep -Seconds $DurationSeconds

if($ResultType -eq "JSON") {

    if($ShowMessages -eq $true) {
        Write-Output "Execution is done! Returning JSON results..."
    }

    return $results | Select $columnList | ConvertTo-Json -Compress
}
else {

    if($ShowMessages -eq $true) {
        Write-Output "Execution is done! Returning Text results..."
    }

    return $results;
}
#endregion
