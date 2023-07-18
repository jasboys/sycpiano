Setlocal enabledelayedexpansion

Set "Pattern=latin"
Set "Replace="

For %%# in ("*.*") Do (
    Set "File=%%~nx#"
    Ren "%%#" "!File:%Pattern%=%Replace%!"
)

Pause&Exit