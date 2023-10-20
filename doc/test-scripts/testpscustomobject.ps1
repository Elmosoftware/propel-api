param (
    [hashtable]$HashTableVariable = @{One = 1; Two = 2; Three = 3},
    [pscustomobject]$obj
)

#$data = [   hashtable    ]@{

<#$data = [pscustomobject]  @{
    First = 'First Item as string'
}
#>

$data = [PSCustomObject]  @{_First = (Get-Date)
    Second = "\`a"
    'Third' = $wer
    Fourth = [int]1
    "Fifth" = -234.45
    Sixth = if(2 -eq 2) {
        $var = "var"
        "Es 2 igual a dos"
    }
    else {
        "No es"
    }
    Seventh = "Last 
    Value"
    "Eighth" = @"
This= is a here string.
"@
    "Nineth" = @(1,
        2,
        3)
    Tenth = [pscustomobject]@{
        Tenth_1 = 12
        Tenth_2 = @{
            "aqua" = "Water"; Ext = "Other"
            Noxtro = @"
Now a here string
with 2 lines.
"@
            Cond = if(3 -eq 3) {
                $var3 = "var3"
                "Is 3!!"
                }
                else {
                "No es"
                }
            }
        }
}

#$data2 = [pscustomobject]@{Name = $wer; "Other Attribute" = -234.45; CalculatedField = if(2 -eq 2) { $var = "var"; "Es 2 igual a dos" } else { "No es" }; Last = "Last Value" }

<#
$data3 = [pscustomobject]@{
    _1retr = "Hola"
    Name = $wer

    "Other %&/#Attribute" = -234.45
    CalculatedField = if(2 -eq 2) {
        $var = "var"
        "Es 2 igual a dos"
    }
    else {
        "No es"
    }
Invalid = 
Last = "Last Value"
}
#>



"Data:"
$data
"`r`nData type:"
$data.GetType().FullName
#"Data2:"
#$data2