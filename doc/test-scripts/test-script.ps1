
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

    [Parameter(HelpMessage='Testing Personalized help message here for this credentials. Select any credentials!')]
    $PropelCredentials,

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
    [DateTime]$AdditionalTypesDatetime = "2020-01-01",

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

function GetLongerText {
    param (
        [int32]$Index
    )

    [int32]$i = 0

    if ($Index % 5 -eq 0) {
        $i = 4
    }
    elseif ($Index % 4 -eq 0) {
        $i = 3
    }
    elseif ($Index % 3 -eq 0) {
        $i = 2
    }
    elseif ($Index % 2 -eq 0) {
        $i = 1
    }
    else {
        $i = 0
    } 

    return $longerText[$i]
}
	
#endregion

#region Private Members
	
#endregion

#region Public Methods

#endregion

#region Script Body

$columnList = @( "Result Nbr", "Name", "Duration", "Longer Text", "Current Date", "This Machine", "Culture", "Date Time Format");

$longerText = @(
#0
@"
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae tellus enim. 
Donec sollicitudin, est eu posuere tempus, velit ipsum semper ligula, at gravida metus 
metus non diam. 
"@,  
#1
@"
Aenean pellentesque, metus ac ultricies interdum, mi ligula venenatis neque, a eleifend mi 
arcu ac turpis. Praesent rhoncus nibh ut sagittis finibus. Proin suscipit fermentum massa 
quis bibendum.
"@,
#2
@"
Donec adipiscing tristique risus nec feugiat in fermentum posuere. Vulputate ut pharetra sit amet. 
In hendrerit gravida rutrum quisque non tellus orci.
"@,
#3
@"
Praesent nulla sapien, molestie hendrerit pretium at, tempus eget ligula. Donec pellentesque, 
lacus a iaculis ornare, eros eros varius metus, sed faucibus elit odio nec odio.
"@,
#4
@"
Morbi eget lorem tempus sem aliquam faucibus. Donec in lectus elit. Nunc posuere risus et 
lectus gravida cursus. Vestibulum varius nisl vel mauris iaculis gravida. 
Mauris eu mi consectetur, ullamcorper nisi et, ultrices augue.
"@
)

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
            "Longer Text" = GetLongerText -Index $i; 
            "Current Date" = (Get-Date).ToString(); 
            "This Machine" = $Env:ComputerName; 
            "Culture" = (Get-Culture).NativeName;
            "Date Time Format" = (Get-Culture).DateTimeFormat.FullDateTimePattern;
            })
    }

    $columnList = ($columnList | Select-Object -First $ColumnCount)
}
else {

    if($ShowMessages -eq $true) {
        Write-Output "Adding TEXT results ..."
    }

    $results = "This is a text result. plus a long text: " + $longerText[0]
}

Start-Sleep -Seconds $DurationSeconds

if($ResultType -eq "JSON") {

    if($ShowMessages -eq $true) {
        Write-Output "Execution is done! Returning JSON results..."
    }

    return $results | Select-Object $columnList | ConvertTo-Json -Compress
}
else {

    if($ShowMessages -eq $true) {
        Write-Output "Execution is done! Returning Text results..."
    }

    return $results;
}
#endregion
