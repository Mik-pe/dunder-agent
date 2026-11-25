# Dogfooding

## Gränsvärdesfel i Dunder

Kör från repots rot med Dunder 0.12.1 i PATH och en byggd agent. Körningen skapar en tillfällig arbetskopia och raderar den när bedömningen är klar.

```sh
dunder run dogfood/run.ddr --offline --locked -- build/dunder-agent
```

Funktionen ska hålla ett värde inom ett slutet intervall. Startläget har två gröna tester och ett rött. Agenten får reparera funktionen och köra kontrollerna. Bedömaren kräver att ursprungstesterna är byteidentiska, att agenten faktiskt har kört en godkänd kontroll och att den reparerade funktionen klarar tre ytterligare tester i en ny katalog. De ytterligare fallen täcker ett negativt intervall, gränserna själva och ett intervall där gränserna sammanfaller.

Den 25 november 2026 klarade GLM-5.4 uppgiften på 31,7 sekunder med OpenCode 2.3.2, Dunder 0.12.1 och macOS ARM64. Agenten listade katalogen, läste implementationen och testerna, redigerade funktionen och körde testerna. Bedömaren fick sex godkända tester. En omkörning från en ren klon tog 21,5 sekunder och klarade samma sex tester. Tiderna avser agentkörningen från start till slutsvar. Bygget och den fristående bedömningen ligger utanför mätningen.

## Jämför harnessar lokalt

Bygg bedömaren från repots rot. Körningen använder Dunder 0.12.1, Node och Git från PATH. Katalogen för resultat måste vara ny. `reference` verifierar startläget och referenslösningen lokalt utan modell.

```sh
dunder build dogfood/compare.ddr --locked -o build/compare
build/compare limit reference build/dunder-agent 0 build/results/reference/limit
build/compare limit dunder build/dunder-agent 1 build/results/limit/dunder-1
build/compare limit opencode "$(command -v opencode)" 1 build/results/limit/opencode-1
```

| Område | Uppgifter |
| --- | --- |
| Dunder | `limit`, `ranges`, `utf8-page`, `billing-resume` |
| Tillstånd, transaktioner och samtidighet | `settings`, `ledger`, `inflight` |
| Parsning, ordning och avrundning | `csv`, `pages`, `jobs`, `invoice` |
| Flerfilsmigrering och återupptagning | `snapshots` |

Varje försök får en ny Git-arbetskatalog och 300 sekunder. Modellen ser uppgiften och de publika testerna. En lyckad `./check` stämplar filträdets innehåll. Efter avslut verifierar bedömaren att stämpeln gäller det inlämnade trädet, att de skyddade testerna är byteidentiska samt att publika och dolda tester passerar i en ny katalog. I `snapshots` och `billing-resume` startar CLI:t om och återöppnar sessionen för den andra instruktionen. Varje deluppgift kräver sin egen godkända kontroll.

Resultatkatalogen får en JSON-rad med modell, verktygsversion, startrevision, kontrollsummor, tid och utfall samt privata loggar per tur. Kör tre gånger på varje uppgift. Två godkända försök ger en löst uppgift. Rangordna efter antal lösta uppgifter och redovisa mediantid och manuella ingrepp. Fel i jämförelseverktygets konfiguration och avbrott hos modellleverantören redovisas separat och körs om.

I pilotuppgiften `limit` klarade Dunder Agent, OpenCode 2.3.2, Pi 1.6.0, Goose 1.61.0 och Cline 3.0.75 samma publika och dolda tester med GLM-5.4. En tidig OpenCode-körning använde fel arbetskatalog via miljövariabeln `PWD` och ett första Cline-försök saknade fungerande leverantörsinställningar. Båda kördes om efter rättning. Alla tolv referenslösningarna passerade. Pilotresultaten ger ännu ingen rangordning.

Bedömaren har adapter för `dunder`, `opencode`, `pi`, `goose` och `cline`. Pi, Goose och Cline kan använda `ZAI_API_KEY` eller nyckeln i OpenCodes GLM-konfiguration. Aider saknas i leverantörens lista över tillåtna abonnemangsverktyg. En framtida jämförelse med Aider kräver separat modellåtkomst. [Z.AI:s verktygslista](https://docs.z.ai/devpack/tool/others)

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
