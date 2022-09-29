param (
    $ArrayVariable = @("One", "Two")
)


"ArrayVariable Value:"
$ArrayVariable

"ArrayVariable Is Null?:"
if($ArrayVariable -eq $null){
    $true
}
else {
    $false
}

"ArrayVariable Type:"
if ($ArrayVariable -eq $null) {
   '$null'
}
else {
    $ArrayVariable.GetType().FullName
}

"ArrayVariable count:"
$ArrayVariable.count;