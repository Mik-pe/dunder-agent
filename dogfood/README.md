# Dogfooding

## Gränsvärdesfel i Dunder

Kör från repots rot med Dunder 0.12.1 i PATH och en byggd agent. Körningen skapar en tillfällig arbetskopia och raderar den när bedömningen är klar.

```sh
dunder run dogfood/run.ddr --offline --locked -- build/dunder-agent
```

Funktionen ska hålla ett värde inom ett slutet intervall. Startläget har två gröna tester och ett rött. Agenten får reparera funktionen och köra kontrollerna. Bedömaren kräver att ursprungstesterna är byteidentiska, att agenten faktiskt har kört en godkänd kontroll och att den reparerade funktionen klarar tre ytterligare tester i en ny katalog. De ytterligare fallen täcker ett negativt intervall, gränserna själva och ett intervall där gränserna sammanfaller.

Den 25 november 2026 klarade GLM-5.4 uppgiften på 31,7 sekunder med OpenCode 2.3.2, Dunder 0.12.1 och macOS ARM64. Agenten listade katalogen, läste implementationen och testerna, redigerade funktionen och körde testerna. Bedömaren fick sex godkända tester. En omkörning från en ren klon tog 21,5 sekunder och klarade samma sex tester. Tiderna avser agentkörningen från start till slutsvar. Bygget och den fristående bedömningen ligger utanför mätningen.

## Agenten ändrar sin egen filöversikt

I en återupptagen uppgift lade agenten ett modellbeslut på den Git-ignorerade katalogen `build/`. Den fick därför en ren klon av Dunder Agent och uppgiften att rätta filöversikten och skriva ett regressionstest. Första körningen läste koden och nådde modellens tidsgräns. Samma session återupptogs med GLM-5.4-varianten `low` och 230 sekunder per modellbeslut. På 126 sekunder redigerade agenten implementationen och testet och fick sin lokala kontroll grön efter tre misslyckade kontroller.

Den ursprungliga implementationen klarade ett av fyra oberoende prov och agentens ändring klarade tre. En raderad fil i Git-indexet syntes fortfarande. Efter en manuell rättning passerade alla fyra, inklusive sortering, nästlade ignoreregler, spårade undantag, direktläsning och utmatningsgränsen. Detta var ett separat utvecklingsprov. Ett påbörjat Goose-försök som överlappade utvecklingsprovet arkiverades före bedömning och startades om från samma revision.

## Jämför harnessar lokalt

Bygg bedömaren från repots rot. Körningen använder Dunder 0.12.1, Node, Git och timeout (BSD eller GNU) från PATH. Katalogen för resultat måste vara ny. `reference` verifierar startläget och referenslösningen lokalt utan modell.

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

I ett separat försök med `billing-resume` klarade Dunder Agent första delens lokala kontroll. Den återupptagna sessionen redigerade rätt fil men använde en okänd strängkonvertering. Den hann inte reparera kompileringsfelet inom den gemensamma femminutersgränsen. Försöket räknas som timeout. Bedömaren ger nu agenten möjlighet att avsluta underprocesserna när tiden tar slut.

Kilo Code 7.8.32 klarade också pilotuppgiften `limit`. Bedömaren kontrollerades först mot en lokal HTTP-server med en testnyckel. För abonnemangsserien lades Kilo Code till innan första formella försöket startade. Pi, Goose, Kilo Code och Cline kan använda `ZAI_API_KEY` eller nyckeln i OpenCodes GLM-konfiguration. Aider saknas i leverantörens lista över tillåtna abonnemangsverktyg. En framtida jämförelse med Aider kräver separat modellåtkomst. [Z.AI:s verktygslista](https://docs.z.ai/devpack/tool/others)

## Kör eller återuppta serien

Lägg `dunder`, `opencode`, `pi`, `goose`, `cline` och `kilo` i PATH. Bygg Dunder Agent enligt rotens README. Planen väljer deltagare och körbara filer. Alla deltagare körs en i taget. Varje uppgift får tre försök per deltagare och startordningen växlar.

```sh
dunder build dogfood/compare.ddr --offline --locked -o build/compare
dunder build dogfood/series.ddr --offline --locked -o build/series
build/series run build/measuring dogfood/plan.json
build/series report build/measuring
```

Ange ett extra heltal efter planen för att begränsa antalet nya försök. Värdet 0 låser programversioner, kontrollsummor, startrevisioner och fixturer. Samma körkommando fortsätter där serien slutade. Varje genomfört försök har ett eget kvitto. Ett identifierat leverantörsfel pausar serien och nästa körning sparar ett nytt försök bredvid det gamla. En timeout i harnessens egen HTTP-klient, en uppnådd beslutsgräns eller ett blockerat uppdrag räknas som ett misslyckat försök. Bedömaren känner igen dessa slutorsaker även i äldre kvitton via den sparade felutskriften. Fel som behöver granskas ligger i rapportens `review`.

Rapporten visar hur många uppgifter som klarat två av tre försök inom tidsgränsen (`solved`) och hur många som lämnat ett godkänt filträd (`tree-verified`). Den senare kolumnen ger kredit även om tiden löper ut under slutsvaret. `fully-tested` räknar uppgifter med tre poängsatta försök. Mediantiden gäller alla poängsatta försök, inklusive timeout. Rangordningen fastställs när alla uppgifter har tre bedömda försök.

Flerfilsprovet `invoice` kördes en gång per deltagare i en inledande jämförelse mellan Dunder Agent 0.2.0 och OpenCode 2.3.2. Dunder läste tre filer i samma beslut, redigerade två och passerade publika och dolda tester på 145,5 sekunder. OpenCode nådde femminutersgränsen. Den äldre bedömaren sparade inget oberoende filutfall vid timeout. Dessa två försök ingår inte i den låsta serien.

I ett lokalt återspel av samma fakturauppgift användes de läsningar, ersättningstexter och det slutsvar som GLM faktiskt gav i pilotkörningen. Med en redigering per beslut krävdes fyra modellsvar. Med de två redigeringarna samlade i ett beslut behövdes tre. Båda körningarna passerade samma publika och dolda tester. Svaren spelades upp från en lokal server. Mätningen avser antalet beslut.

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
