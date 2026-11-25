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

## Agenten implementerar `run -`

En ren klon av 0.6.0 fick uppgiften att läsa en UTF-8-uppgift från stdin. GLM-5.4 med varianten `low` sökte i Dunders standardbibliotek via `--reference`, hittade `io.read_stdin_limit` och ändrade CLI:t och acceptansprovet. Efter 119 sekunder var agentens bygge och egna kontroller gröna.

En separat lokal bedömare körde tretton förberedda prov mot programmet. Ursprungsversionen klarade två. Agentens förslag klarade tolv, inklusive giltig UTF-8 vid exakt 32 KiB, bevarade radslut, återupptagning och avvisning av en terminal som indata. Med `run - --bad` och en öppen pipe väntade programmet på indata innan det upptäckte argumentfelet. Efter att argumentkontrollen flyttats före läsningen klarade 0.7.0 alla tretton. Regressionen med en öppen pipe ingår i `tests/acceptance.ddr`.

## Fel sist i en lång testlogg

Det lokala acceptansprovet skapar en kontroll som skriver 1,7 MB byggutskrift och lägger felmeddelandet på stderr. Modellfixturen kan bara välja rätt reparation efter att den fått diagnosen. Provet kräver att samma kontroll passerar på den ändrade filen. Kör det med `dunder run tests/acceptance.ddr --offline --locked -- build/dunder-agent`. I en separat jämförelse med åtta loggfall klarade 0.7.0 ett och 0.8.0 alla åtta. Fallen omfattade bl.a. samtidig lång stdout och stderr, lyckade kontroller med flera MB utdata och en ogiltig UTF-8-byte intill läsbar diagnostik.

## Jämför harnessar lokalt

Bygg bedömaren från repots rot. Körningen använder Dunder 0.12.1, Node, Git och timeout (BSD eller GNU) från PATH. Återupptagning med Cline kräver också tmux. Katalogen för resultat måste vara ny. `reference` verifierar startläget och referenslösningen lokalt utan modell.

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

### Återupptagning med Cline

Cline 3.0.75 sparar sessionen med ett annat id än `conversationId` i JSON-händelserna. I lokal kontroll avvisade `cline --json --id` följdfrågan även med det sparade sessions-id:t. Bedömaren öppnar därför samma session i Clines ordinarie terminal, skickar följdfrågan och väntar på dess sparade slutsvar. Tiden för omstarten ingår i samma femminutersbudget. Ett lokalt prov med det riktiga CLI:t och en modellfixtur verifierar att båda instruktionerna når modellen efter processbytet. [Clines CLI-referens](https://github.com/cline/cline/blob/main/docs/cli/cli-reference.mdx)

```sh
dunder build dogfood/compare.ddr --offline --locked -o build/compare
dunder run dogfood/cline_test.ddr --offline --locked -- build/compare "$(command -v cline)"
```

Den inledande serien med Dunder Agent 0.2.0 sparas som baslinje. Dess Cline-försök med felaktigt sessions-id står kvar för granskning. Serien med 0.5.0 börjar om för alla sex deltagare med samma tolv uppgifter, modell, tidsbudget och tre upprepningar. Cline står först i den roterande startordningen för att den rättade återupptagningen ska provas tidigt.

Vid första GLM-försöket i den nya serien återupptog både Cline och Dunder sessionen efter en godkänd första del. Cline nådde femminutersgränsen före en godkänd slutkontroll. Dunder skrev `let` i Dunder-koden, fick ett kompileringsfel och nådde sedan sin modellgräns på 140 sekunder. Dunder lade också till ett test i den skyddade filen `public.ddr`. Bedömaren kräver byteidentiska ursprungstester även vid rena tillägg. Uppgiftsmeddelandet namnger inte de skyddade filerna. Det påverkar hur `protected-file` ska tolkas.

Första varvet på `billing-resume` är bedömt för alla sex. Pi och Goose klarade båda delarna på 167,6 respektive 276,8 sekunder. OpenCode lämnade ett godkänt filträd men nådde tidsgränsen. Kilo Code nådde också tidsgränsen och saknade godkänd slutkontroll. Alla sex återupptog sessionen utan manuellt ingripande. Detta är ett av tre försök per deltagare på en av tolv uppgifter.

På CSV-uppgiften klarade Dunder Agent 0.5.0 sitt första försök på 150,4 sekunder och OpenCode nådde tidsgränsen. Sedan tog abonnemangets femtimmarskvot slut. Pi returnerade processkod 0 trots att modellens slutmeddelande innehöll HTTP 429 och leverantörskod 1308. Goose returnerade processkod 1 med samma leverantörskod i sin avslutande felhändelse. Bedömaren läser nu dessa slutmeddelanden så att kvotstopp ger nya försök för båda. Sparade kvitton och filträdens bedömningar behålls. Kilo Codes kvotstopp identifierades redan av dess adapter.

## Kör eller återuppta serien

Lägg `dunder`, `opencode`, `pi`, `goose`, `cline` och `kilo` i PATH. Bygg Dunder Agent enligt rotens README. Planen väljer deltagare och körbara filer. Alla deltagare körs en i taget. Varje uppgift får tre försök per deltagare och startordningen växlar.

```sh
dunder build dogfood/compare.ddr --offline --locked -o build/compare
dunder build dogfood/series.ddr --offline --locked -o build/series
dunder run dogfood/series_test.ddr --offline --locked -- build/series
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
