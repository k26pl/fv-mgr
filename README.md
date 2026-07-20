# Instrukcja uruchomienia

Pierwsze uruchomienie:
Dla systemu Linux, zainstalowanego prisma i docker:

- `./prepare_db.sh`
- uzupełnić .env zgodnie z .env.example
- w katalogu głównym dodać certyfikat ksef: `ksef.crt` i `ksef.key`
- `npm run dev`

W pozostałycch przypadkach (inny system/inna konfiguracja):

- utworzyć plik .env i uzupełnić zgodnie z .env.example
- w katalogu głównym dodać certyfikat ksef: `ksef.crt` i `ksef.key`
- uruchomić bazę danych postgres
- `prisma generate`
- `prisma db push`
- `npm run dev`

# Dane testowe:

W wersji hostowanej przeze mnie jest podany NIP jednej z większych firm.
Jest ona również wykorzystywana przez innych do testów, dzięki czemu w KSEF
z najdują się już przykłądowe faktury. Nie zostały one umieszczone tam
przeze mnie, jako iż dane w systemie test KSEF są edytowalne publicznie
nie odpowiadam za ich treść.

# Struktura kodu:

| ścieżka          | opis                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| /prisma/         | schema prismy oraz migracje                                                        |
| /public/         | statyczne zasoby                                                                   |
| /src/            | główny kod aplikacji                                                               |
| /src/app/        | api(backend) aplikacji. Część danych jest przekazywana przez server components/ssr |
| /src/backend/    | funkcje wykorzystywane przez część backendową                                      |
| /src/components/ | komponenty                                                                         |
| /src/utils/      | dodatkowe funkcje pomocnicze                                                       |
| /src/prisma/     | automatycznie wygenerowany klient Prisma                                           |
| /testdata/       | dodatkowe dane do testóœ, generator faktur                                         |

# Zastosowanie bibliotek:

Osobiście preferuję używanie niskiej liczby bibliotek, i pisanie większości kodu samemu. Programowanie to moje hobby, dodatkowe zalety to lepsza wydajność, ograniczenie ryzyka supply chain attacks, oraz zdobywanie
większego doświadczenia. Posiadam jednak również duże doświadczenie w czytaniu dokumentacji, wykorzystywaniu bibliotek, a nawet w okazjonalnym zgłaszaniu błędów lub poprawek. Jestem otwarty na dostosowanie się do praktyk i bibliotek stosowanych przez współpracowników.

# Faktury:

Aplikacja zakłada, że zarówno nabywca jak i odbiorca to ten sam podmiot oraz że jedną ze stron transakcji zawsze jest firma której NIP jest podany w .env. W przypadku, gdyby obsługiwanie innego rodzaju faktur było wymagane, zmiana nie powinna być trudna: do modelu Invoice należy dodać dwa pola typu Company, dodać odpowiednie pola w ui/przetwarzaniu faktur (większość będzie taka sama jak już dodane, z taką różnicą że trafią odpowiednio do sprzedawcy, nabywcy i odbiorcy).
Chociaż w większości przypadków zalecane jest korzystanie z prawa Postela ("Be conservative in what you do, be liberal in what you accept from others."), to w przypadku danych finansowych błędy mogą być bardzo kosztowne, oraz istnieje podwyższone ryzyko wprowadzenia złośliwych danych przez osoby atakujące, faktury z błędami są odrzucane (w tym np. faktury FA2 zawierające rzeczy dodane dopiero w FA3). Jednak z uwagi że jest to demo pisane w ograniczonym czasie, możliwe jest że istnieją błędy.

# Testy:

Aplikacja wykorzystuje funkcje testowania wbudowane w nodejs (node:test) zamiast zewnętrznego narzędzia (jest).
Zaletą jest łatwiejsza konfiguracja, jednak oba API są bardzo podobne, użycie jest wymaga jedynie zmiany kilku nazw. Dodatkowo napisałem fuzzer, który generuje losowo faktury (zarówno prawidłowe jak i nie) i weryfikuje wyjście. Jednak z powodu zastosowania elementów metodyki test-driven-development, implementacja parsera oraz testów jest zbliżona, dlatego nie wykluczam całkowicie występowania błędów

# Przechowywanie plików:

Pliki są przechowywwane w [Backblaze](https://backblaze.com). Ponieważ wykorzystywane są jedynie API do autoryzacji oraz generowania podpisanych linków, zmiana na chmury na stosującą s3 (np AWS) wymaga jedynie podmienienia biblioteki i zmiany zmiennych środowiskowych. W celu oszczędzania miejsca oraz zapobniegnięcia spamowi, wdrożona aplikacja okresowo usuwa przesłane pliki. Możliwe jest więc, że przesłane pliki pozostaną w bazie danych lecz zostaną usunięte w B2. Błędy przez to spowodowane powinny zostać prawidłowo obsłużone, i nie będą wystepować gdyby aplikacja była pisana w trybie nie-demo.

# Usuwanie:

Wiele miejsc nie zawiera opcji usuwania danych. W "rzeczywistej" wersji najprawdopodobniej wymagane było by zachowywanie logów oraz możliwość audytu kto i co zmienił z powodów prawnych (zarówno obowiązki podatkowe, jak i możliwość dochodzenia w przypadku błedu pracownika, włamania i podobnych sytuacji). Najprawdopodobniej większość danych nie będzie mogła być z tych powodów usunięta, w przypadku wysyłania danych do ksef, jpk itd najprawdopodobniej niezbędne będzie wystwaienie korekty, dodatkowo menedżerowie oraz dział it może zarządać dostępu do historii, więc jakbym miał to zaimplementować to w większości miejsc nie było by to usuwanie, lecz ustawienie odpowiednich flag (np isDeleted:true, deletedDate:new Date(), deletedBy: user itp).
W celu zapobiegnięcia spamowi oraz przepełnienia bazy danymi testowymi, niektóre tabele mogą być okresowo czyszczone.

# Wczytywanie po NIP

Aplikacja sprawdza stan z dzisiaj (lub wczoraj w przypadku błędu).

# CSRF/zabezpieczenia:

Aplikacja jest projektowana z założeniem, że ewentualny system kont będzie przechowywał token w LocalStorage a nie jako ciasteczko. W przypadku wymagania zastosowania ciasteczek należy dodać zabezpieczenia przed CSRF.
Ponieważ system kont był poza zakresem, aplikacja nie zawiera żadnego systemu autoryzacji/autentyfikacji.
Gdybym miał go dodać, to w zależności od wymagań:
a) skorzystał lub dostosował gotowy, używany już w innym miejscu system kont / sso
(jeśli organizacja taki posiada)
b) skorzystał z już istniejącego systemu (np auth0)
c) Jestem w stanie wykonać własny system, choć z powodów bezpieczeństwa
(duży zakres i duże ryzyko w razie błędu), jest to dla mnie opcja zarezerwowana jedynie w razie konieczności
(np. specjalne wymagania klienta, wymagają tego założenia techniczne)

# Wygląd:

Layout starałem się zrobić w sposób wygodny w użytkowaniu. Dobry wygląd nie był priorytetem - za równo z powodu,
że jest to wewnętrzna aplikacja/demo, jak i krótkiego okresu casu przeznaczonego na jej stworzenie.
Jednak z uwagi na zastosowanie material ui aplikacja wygląda w miarę nowocześnie. Schemat kolorystyczny można łatwo dostosować w theme.ts

# Język:

Moją osobistą preferencją jest pisanie kodu oraz komentarzy w j. Angielskim. Ponieważ aplikacja jest przeznaczona dla Polskiej firmy tekst w aplikacji jest po Polsku. Nie przeszkadza mi jednak praca z kodem w którym nazwy i/lub komentarze są po polsku, oraz zastosowany jest system i18n/l10n.
Dokumentację wykonałem po Polsku, jednak nie ma najmniejszego problemu abym wykonywał ją po Angielsku.
Znam różne osoby które również interesują się programowaniem i nie mówią po Polsku, rozmowa po Angielsku
zarówno na tematy techniczne jak i nietechniczne nie sprawia mi problemów (choć wciąż pracuję nad akcentem)

# Komentarze:

Osobiście preferuję dodawać jedynie komentarze które informują o założeniach oraz rzeczach nieoczywistych,
wg mnie gdzie to możliwe kod powinien być pisany w sposób zrozumiały, ponieważ komentarze mogą przestać być "zsynchronizowane" z kodem. Jednak nie powinienem mieć problemów z dostosowaniem się do stylu w jakim jest już napisany kod.

# Formatowanie kodu:

Korzystam z automatycznego formatowania za pomocą Prettier, dostosowanie ustawień do stylu już używanego przez aplikację nie powinno być problemem

# React Compiler:

Aplikacja wykorzystuje React Compiler, dzięki czemu ręczne optymalizacje (np. useMemo) nie są wymagane w większości miejsc.

# Znane ograniczenia oraz Co zrobiłbym dalej:

Niektóre pliki zawierają komentarze z następującą treścią:

- @TODO: Co uważam za warte zrobienia następnie
- W niektórych miejscach z uwagi na to, że ta aplikacja to demo, postąpiłem inaczej niż zrobił bym to w
  pełnej wersji produkcyjnej. Takie przypadki są opisane komentarzami, w których tłumaczę dlaczego podjąłem taką decyzję
  i co bym zrobił w przypadku pisania "rzeczywistej" aplikacji.

Dodatkowo:

- W przypadku gdyby aplikacja miała być obsługiwana przez kilka pracowników na raz dodał bym synchronizację
  za pomocą Websockets oraz kolejki wiadomości (np NATS, Redis), umożliwiającą pracownikow widzenie dokonywanych
  zmian w czasie rzeczywistym (np. po dodaniu kategorii wszystkim pozostałym użytkownikom wyświetla się ona
  od razu, bez odświeżania).

Ważniejsze ograniczenia:

- W przypadku faktur analizowane są jedynie pola które trafią do bazy danych, pozostałe pola są ignorowane, i system może zaakceptować fakturę która technicznie nie jest poprawna
- System pobiera z faktury jedynie NIP, a następnie odpytuje serwer MF o pozostałe dane kontrahenta.

# Zadanie:

1. Kontekst i cel

   Zadanie polega na zaprojektowaniu i zbudowaniu samodzielnej aplikacji webowej, która:

1. uporządkuje ewidencję faktur,
1. umożliwi automatyczne pobieranie faktur z KSeF oraz wgrywanie plików faktur spoza
   KSeF (upload),
1. pozwoli kategoryzować koszty,
1. umożliwi podgląd faktur (PDF oraz danych z XML KSeF) bezpośrednio w aplikacji.
   Charakter zadania rekrutacyjnego. Oceniamy sposób myślenia, jakość kodu i decyzje pro-
   jektowe - nie oczekujemy produkcyjnej kompletności. Ten dokument opisuje wymagania,
   a nie pełne rozwiązanie techniczne (jak to zaimplementować). Stack jest narzucony (patrz
   sekcja 7), natomiast wybór architektury i modelu danych należy do Ciebie i jest częścią
   oceny.
   Zanim zaczniesz projektować, warto zrobić krótki research istniejących rozwiązań rynko-
   wych do zarządzania fakturami i integracji z KSeF - podpatrzenie, jak inni rozwiązują ewi-
   dencję, kategoryzację czy obieg dokumentów, pomoże Ci w decyzjach funkcjonalnych i
   UX. Swoje wnioski krótko opisz w README (patrz sekcja 9).
1. Zakres
   W zakresie zadania (cztery obszary)
1. Rejestr dokumentów - ewidencja faktur z filtrowaniem, typami dokumentów i danymi
   kontrahenta.
1. Pobieranie z KSeF i upload - import faktur do bufora z KSeF, wgrywanie plików faktur
   spoza KSeF, harmonogram automatycznego pobierania, akceptacja i przeniesienie
   do rejestru.
1. Kategoryzacja - drzewo kategorii, przypisywanie dokumentów, reguły automatyczne.
1. Podgląd dokumentów - przeglądanie faktur (PDF i danych z XML KSeF) bezpośrednio
   w aplikacji.

Poza zakresem (proszę nie implementować)
• Wystawianie i wysyłanie faktur do KSeF (integrujemy wyłącznie kierunek pobierania).
• Raporty / eksporty do Excela.
• Integracja z konkretnym systemem sprzedażowym / POS.
• Pełna obsługa księgowa (dekretacja, JPK, deklaracje itp.).

Wymagania funkcjonalne
3.1 Rejestr dokumentów
• Centralny widok listy wszystkich dokumentów.
• Typy dokumentów: co najmniej faktura sprzedażowa i faktura kosztowa. Użytkownik
może dodawać własne typy (np. nota obciążeniowa, nota odsetkowa, nota karna).
Każdy typ ma określony kierunek: należność (do otrzymania) albo zobowiązanie (do
zapłaty).
• Filtrowanie listy co najmniej po: typie dokumentu, kontrahencie / dostawcy, dacie wy-
stawienia, terminie płatności oraz kategorii.
• Sortowanie - m.in. po dacie wystawienia i terminie płatności.
• Konfigurowalne kolumny - użytkownik może wybrać, które kolumny są widoczne (po-
każ / ukryj), a najlepiej także zmienić ich kolejność.
• Dodawanie / edycja dokumentu ręcznie (dla dokumentów spoza KSeF) z kompletem
wymaganych pól.
• Każdy dokument jest powiązany z kontrahentem (dane kontrahenta) i opcjonalnie z
kategorią.
Minimalny zestaw pól dokumentu (do doprecyzowania przez kandydata): numer, typ, kon-
trahent, data wystawienia, termin płatności, kwota netto / VAT / brutto, numer rachunku
do zapłaty, kategoria, źródło (KSeF / upload / ręczny), numer KSeF (jeśli z KSeF), status.
3.2 Pobieranie z KSeF (bufor -> akceptacja -> rejestr)
• Integracja z KSeF w celu pobierania faktur (kierunek: odbiór).
• Pobieranie ręczne: użytkownik wskazuje zakres dat (od–do) oraz rodzaj faktur do po-
brania (kosztowe lub sprzedażowe).
• Dwuetapowy obieg dokumentu:
– Faktury pobrane z KSeF trafiają najpierw do bufora (poczekalni), a nie bezpośred-
nio do rejestru dokumentów.
– Harmonogram automatycznego pobierania - konfigurowalny, z możliwością uru-
chamiania wielokrotnie w ciągu doby (np. o 1:00, 2:00, 3:00 - dowolna liczba i
godziny wg ustawień).
– Użytkownik przegląda bufor i akceptuje wybrane pozycje. Zaakceptowane doku-
menty są automatycznie przenoszone do rejestru dokumentów.
• Odporność na duplikaty - ta sama faktura nie może zostać pobrana ani przeniesiona
do rejestru dwukrotnie.

3.3 Kategoryzacja
• Definiowanie kategorii kosztów w ustawieniach modułu.
• Kategorie w strukturze drzewa (hierarchii) - kategoria może mieć podkategorie.
• Ręczne przypisywanie dokumentu do kategorii.
• Filtrowanie dokumentów po kategorii.
• Automatyczna kategoryzacja na podstawie kontrahenta: możliwość ustalenia, że
dokumenty danego kontrahenta zawsze trafiają do wskazanej kategorii (reguła:
kontrahent -> kategoria). Przy pobraniu lub dodaniu dokumentu kategoria jest
przypisywana automatycznie zgodnie z regułą.
3.4 Podgląd dokumentów
• Użytkownik może otworzyć podgląd dowolnego dokumentu bezpośrednio w aplika-
cji, bez pobierania pliku na dysk.
• PDF (załączniki wgrane przez upload oraz wizualizacje faktur): renderowanie w prze-
glądarce - przewijanie stron, powiększenie.
• XML w schemacie KSeF FA(2)/FA(3): czytelna, przyjazna prezentacja danych faktury
(strony transakcji, pozycje, kwoty netto / VAT / brutto) - nie surowy XML.
• Podgląd dostępny z poziomu listy dokumentów (rejestru) oraz bufora.
• Dla dokumentów dodanych ręcznie (bez pliku źródłowego) - prezentacja danych z for-
mularza w tym samym, spójnym widoku.
• (Mile widziane) Szybki podgląd w panelu bocznym / modalu, bez opuszczania listy.
3.5 Wgrywanie dokumentów spoza KSeF (upload)
• Poza pobieraniem z KSeF użytkownik może wgrać do systemu faktury, których nie ma
ani w rejestrze, ani w KSeF (np. faktury zagraniczne, dokumenty papierowe / zeskano-
wane, noty) przez upload pliku.
• Obsługiwane formaty: co najmniej PDF (oryginał / załącznik) oraz XML w schemacie
KSeF FA(2)/FA(3) - dla pliku ustrukturyzowanego dane wczytują się automatycznie;
dla PDF dopuszczalne uzupełnienie pól ręcznie, a plik pozostaje powiązany z doku-
mentem jako załącznik.
• Wgrany dokument trafia do bufora na tych samych zasadach co pobrany z KSeF (ak-
ceptacja -> rejestr) albo bezpośrednio do rejestru - decyzja i uzasadnienie po stronie
kandydata.
• Odporność na duplikaty obejmuje także upload (ten sam dokument nie może
powstać dwukrotnie - np. po numerze faktury + NIP kontrahenta).
• Źródło dokumentu rozróżnia co najmniej: KSeF, upload, ręczny. 4. Model domenowy (koncepcyjny)
Poniżej sugerowane obiekty domenowe z kluczowymi atrybutami. To poziom wymagań -
fizyczny schemat bazy i relacje projektujesz samodzielnie. Etap „bufora” możesz zrealizo-
wać jako status/flagę na dokumencie albo jako osobny byt - Twój wybór.

Obiekt Kluczowe atrybuty
Dokument (faktura) numer, typ, kontrahent, data wystawienia,
termin płatności, kwota netto / VAT / brutto,
rachunek do zapłaty, kategoria (opc.),
źródło (KSeF / upload / ręczny), numer KSeF
(opc.), załącznik (plik, opc.), status (etap: w
buforze / zaakceptowany)
Typ dokumentu nazwa, kierunek (należność / zobowiązanie),
czy systemowy
Kontrahent nazwa, NIP, adres, numer rachunku
bankowego, kategoria domyślna (opc., dla
reguły auto-kategoryzacji)
Kategoria nazwa, kategoria nadrzędna (relacja do
samej siebie - dla drzewa) 5. Integracje
Uwaga ogólna: to specyfikacja wymagań, nie instrukcja implementacji. Szcze-
góły techniczne integracji z KSeF są częścią Twojej pracy badawczej - poniżej
podajemy kierunek i punkty startowe, nie gotowe rozwiązanie.
5.1 KSeF (Krajowy System e-Faktur)
• Do zadania korzystaj wyłącznie ze środowiska testowego KSeF (bez skutków praw-
nych, dopuszcza certyfikaty self-signed).
• Wymagane od modułu: uwierzytelnienie, pobranie faktur w zadanym zakresie dat i wy-
branym rodzaju (kosztowe / sprzedażowe), zasilenie bufora.
• API jest w standardzie REST + OpenAPI; Ministerstwo Finansów udostępnia dokumen-
tację, biblioteki SDK i przykłady (patrz sekcja 12).
• Dopuszczalny wariant: jeśli pełna integracja z KSeF okaże się zbyt czasochłonna w
ramach zadania, akceptujemy warstwę mock / adapter z czystym interfejsem i przy-
kładowymi danymi. W takim wypadku oceniamy sposób zaprojektowania integracji
(abstrakcja, granice, testowalność). 6. Wymagania niefunkcjonalne
• Aplikacja webowa dostępna przez przeglądarkę.
• Trwałe przechowywanie danych w bazie PostgreSQL.
• Filtrowanie i sortowanie powinno działać poprawnie także na większych zbiorach da-
nych (świadomość wydajności).
• Walidacja danych wejściowych: NIP, numer rachunku (format NRB/IBAN, mile
widziana kontrola sumy kontrolnej), kwoty, daty i terminy.
• Harmonogram pobierania z KSeF (mechanizm zadań cyklicznych, konfigurowalny).
• Bezpieczeństwo: dane uwierzytelniające / tokeny do KSeF nie mogą być trzymane na
sztywno w repozytorium ani udostępniane po stronie frontendu - przechowuj je w

zmiennych środowiskowych po stronie serwera. Dotyczy to również wersji wdrożo-
nej.
• Obsługa błędów integracji (np. niedostępność KSeF) - czytelne komunikaty, brak
utraty danych, brak duplikatów. 7. Stack technologiczny i wdrożenie
• Backend: Next.js (App Router) w TypeScript - route handlers / server actions / API
routes. To jest wymagana warstwa backendowa.
• Frontend: React + Next.js (TypeScript). Dobór bibliotek Reactowych (UI, zarządzanie
stanem, formularze itp.) jest dowolny.
• Baza danych: PostgreSQL z ORM Prisma.
• Walidacja: Zod.
• Harmonogram (pobieranie z KSeF): node-cron lub równoważny mechanizm zadań cy-
klicznych.
• Architektura: zachowaj czytelne rozdzielenie backendu (API / logika domenowa / do-
stęp do danych) od frontendu (UI) - logika biznesowa nie może żyć w komponentach
React.
• Aplikacja powinna dać się uruchomić lokalnie, najlepiej jedną komendą (np. docker
compose up).
• Wdrożenie (wymagane). Aplikacja musi być wdrożona i publicznie dostępna pod
działającym adresem URL i działać
tam end-to-end: frontend + API + baza + integracja ze środowiskiem testowym KSeF.
Link do wdrożonej aplikacji podaj w README. 8. Kryteria akceptacji
Rejestr dokumentów
□ Można dodać i edytować dokument z wymaganymi polami.
□ Lista pokazuje dokumenty; działają filtry po typie, kontrahencie, dacie wystawienia i
terminie płatności.
□ Można zdefiniować własny typ dokumentu i przypisać go do dokumentu.
□ Można skonfigurować widoczność kolumn na liście.
Pobieranie z KSeF i upload
□ Pobieranie ręczne po zakresie dat i rodzaju (kosztowe / sprzedażowe) działa; wynik
trafia do bufora.
□ Harmonogram automatycznego pobierania jest konfigurowalny (wiele uruchomień w
ciągu doby).
□ Można wgrać plik faktury spoza KSeF (PDF i/lub XML FA); dla XML dane wczytują się
automatycznie.
□ Akceptacja pozycji z bufora przenosi je do rejestru dokumentów.
□ Ta sama faktura nie zostaje pobrana / wgrana / przeniesiona dwukrotnie.
Kategoryzacja

□ Można przypisać dokument do kategorii i filtrować po kategorii.
□ Reguła „kontrahent -> kategoria” przypisuje kategorię automatycznie.
Podgląd dokumentów
□ Można otworzyć podgląd PDF faktury bezpośrednio w aplikacji.
□ Dane z faktury XML KSeF są prezentowane w czytelnej formie (nie surowy XML).
□ Podgląd jest dostępny z poziomu listy dokumentów i bufora.
Wdrożenie
□ Aplikacja jest dostępna pod publicznym URL i działa (frontend + API + baza).
□ Pełną ścieżkę można wykonać na wdrożonej wersji: wgranie / pobranie faktury -> ak-
ceptacja -> rejestr -> podgląd dokumentu. 9. Zakres dostarczenia (deliverables)
• Repozytorium (link do Git lub archiwum .zip) z kodem źródłowym i historią commi-
tów.
• Działający link do wdrożonej aplikacji (publiczny URL).
• README zawierające: opis architektury i decyzji technologicznych, instrukcję uru-
chomienia, link do wersji wdrożonej, dane testowe / seed, znane ograniczenia oraz
„co zrobiłbym dalej”.
• Testy automatyczne kluczowych ścieżek - mile widziane.
• Krótki research rynku (mile widziane): w README 2-3 zdania o istniejących rozwiąza-
niach do zarządzania fakturami / integracji z KSeF - co warto z nich zaczerpnąć i czym
Twoje podejście się różni.
• Krótka informacja o poczynionych założeniach (patrz niżej). 10. Kryteria oceny
• Zgodność z wymaganiami (pokrycie czterech obszarów).
• Jakość i czytelność kodu, struktura i spójność projektu.
• Modelowanie domeny i danych.
• Podejście do integracji (KSeF) - także gdy oparte na środowisku testowym lub war-
stwie mock z czystym interfejsem.
• Walidacja danych oraz obsługa błędów i przypadków brzegowych.
• Funkcjonalność i przejrzystość interfejsu.
• Wdrożenie i faktycznie działająca aplikacja pod publicznym URL.
• Dokumentacja i łatwość uruchomienia.
• Testy (jeśli obecne).
• Jakość uzasadnienia decyzji projektowych.

11. Zadania dodatkowe (opcjonalne)
    Dla osób, które skończą wcześniej - nie są wymagane do zaliczenia. Punktujemy dodat-
    kowo.
    • Auto-uzupełnianie danych kontrahenta po NIP - po wpisaniu numeru NIP moduł
    pobiera nazwę i adres z publicznego źródła (np. publiczne API wykazu podatników;
    uwaga: rejestr GUS/REGON wymaga zarejestrowanego klucza).
    • Weryfikacja rachunku na „białej liście podatników VAT” - sprawdzenie, czy numer
    rachunku kontrahenta widnieje na wykazie (kontrola poprawności danych kontra-
    henta).
    • Zaawansowane reguły auto-kategoryzacji - np. wg słów kluczowych w nazwie kontra-
    henta lub w tytule dokumentu, poza samą regułą „kontrahent -> kategoria”.
12. Zasoby
    KSeF
    • Portal dla integratorów (dokumentacja API 2.0, SDK dla Javy i .NET, przykłady):
    ksef.podatki.gov.pl/ksef-na-okres-obligatoryjny/wsparcie-dla-integratorow
    • Środowisko testowe API: https://api-test.ksef.mf.gov.pl (interaktywna dokumenta-
    cja OpenAPI pod /docs/v2/index.html)
    • Uwierzytelnienie w środowisku testowym: token KSeF lub certyfikat (dopuszczalny
    self-signed).
    Założenia i pytania
    Tam, gdzie specyfikacja jest niejednoznaczna, przyjmij rozsądne założenie i opisz je w RE-
    ADME - sposób radzenia sobie z niejednoznacznością również oceniamy. Priorytetyzuj: ja-
    kość i architektura kluczowych ścieżek są ważniejsze niż pełne pokrycie wszystkich detali
