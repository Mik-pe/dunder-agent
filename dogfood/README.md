# Dogfooding

## Gränsvärdesfel i Dunder

Kör från repots rot med Dunder 0.12.1 i PATH och en byggd agent. Körningen skapar en tillfällig arbetskopia och raderar den när bedömningen är klar.

```sh
dunder run dogfood/run.ddr --offline --locked -- build/dunder-agent
```

Funktionen ska hålla ett värde inom ett slutet intervall. Startläget har två gröna tester och ett rött. Agenten får reparera funktionen och köra kontrollerna. Bedömaren kräver att ursprungstesterna är byteidentiska, att agenten faktiskt har kört en godkänd kontroll och att den reparerade funktionen klarar tre ytterligare tester i en ny katalog. De ytterligare fallen täcker ett negativt intervall, gränserna själva och ett intervall där gränserna sammanfaller.

Den 25 november 2026 klarade GLM-5.4 uppgiften på 31,7 sekunder med OpenCode 2.3.2, Dunder 0.12.1 och macOS ARM64. Agenten listade katalogen, läste implementationen och testerna, redigerade funktionen och körde testerna. Bedömaren fick sex godkända tester. En omkörning från en ren klon tog 21,5 sekunder och klarade samma sex tester. Tiderna avser agentkörningen från start till slutsvar. Bygget och den fristående bedömningen ligger utanför mätningen.

## Fynd i Dunder 0.12.1

När filskrivningen skulle översätta ett I/O-fel till text gick `map_err` på `Result<(), E>` inte att kompilera. Följande fristående program reproducerar E3003 vid `dunder build` på macOS ARM64.

```dunder
fn label(move n: i32) -> string { n.str() }

fn convert(value: Result<(), i32>) -> Result<(), string> {
    value.map_err(label)
}

fn main() { assert(convert(.Ok).is_ok()) }
```

Kompilatorn rapporterar att varianten `.Ok` saknar payload. Filverktygen matchar tills vidare explicit på `.Ok` och `.Err`.
