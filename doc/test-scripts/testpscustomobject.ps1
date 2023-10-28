param (
    [hashtable]$HashTableVariable = @{One = 1; Two = 2; Three = 3},
    $obj = [PSCustomObject]@{"Hola" = 1},
    [Management.Automation.PSCustomObject]$obj2
    #[PSCustomObject]$obj3

)


$test2 = @{"_First"=(Get-Date); "Second"="`a"; "Third"=$wer; "Fourth"=[int]1; "Fifth"=-234.45; "Sixth"=if(2 -eq 2) {
$var = "var"
"Es 2 igual a dos"
}
else {
"No es"
}; "Seventh"="Last
Value"; "Eighth"=@"
This= is a here string.
"@; "Nineth"=@(1,
2,
3); "Tenth"=[pscustomobject]@{
Tenth_1 = 12
Tenth_2 = @{
"aqua" = "Water"
Ext = "Other"
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
}}



# ERROR $obj = [System.Management.Automation.PSCustomObject]@{"Hola" = 1}
# ERROR $obj = [Management.Automation.PSCustomObject]@{"Hola" = 1}
$obj = [PSCustomObject]@{"Hola" = 1}
#$obj = [System.Collections.Hashtable]@{"Hola" = 1}
#$obj = [Collections.Hashtable]@{"Hola" = 1}
#$obj = [System.Object]@{"Hola" = 1}
#$obj = [Object]@{"Hola" = 1}
#$obj = [PSObject]@{"Hola" = 1}

"OBJ:"
$obj.getType() | format-list *


$test = @{
    First = 'Next is missing opening punctuator'
    Second = 
    @{
        Other = 
        "Other value"
    }
    Third = 23kb
}

<#$data = [pscustomobject]  @{
    First = 'First Item as string'
}
#>

$test = [pscustomobject]  @{_First = (Get-Date); Second = "\`a"; 'Third' = $wer;Fourth = [int]1; "Fifth" = -234.45; Sixth = if(2 -eq 2) {$var = "var"; 
"Es 2 igual a dos"} else {"No es"}; Seventh = "Last\nValue";"Eighth" = [pscustomobject]@{Tenth_1 = 12;Tenth_2 = @{"aqua" = "Water"; Ext = "Other"}}}

$data = [PSCustomObject]  @{_First = (Get-Date)
Second = "\`a" 
'Third
xxx' = $wer
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
This= is @{ a here string.
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



#"Data:"
#$data
#"`r`nData type:"
#$data.GetType().FullName
#"Data2:"
#$data2