/**
 * Javascript native types.
 */
 export enum JSType {
    Object = "Object",
    String = "String",
    Number = "Number",
    Boolean = "Boolean",
    Date = "Date",
    Array = "Array"
}

/**
 * Supported PowerShell types
 */
export enum PSType {
    Object = "System.Object",
    String = "System.String",
    Char = "System.Char",
    Byte = "System.Byte",
    Int32 = "System.Int32",
    Int64 = "System.Int64",
    Boolean = "System.Boolean",
    Decimal = "System.Decimal",
    Single = "System.Single",
    Double = "System.Double",
    DateTime = "System.DateTime",
    XML = "System.Xml.XmlDocument",
    StringArray = "System.String[]",
    Int32Array = "System.Int32[]",
    Array = "System.Array",
    Hashtable = "System.Collections.Hashtable",
    Switch = "System.Management.Automation.SwitchParameter"
}

/**
 * Powershell literals
 */
export enum PowerShellLiterals {
    $null = "$null",
    $true = "$true",
    $false = "$false",
    EmptyObject = "@{}",
    EmptyArray = "@()",
    EmptyString = ""
}
