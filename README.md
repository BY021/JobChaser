# JobChaser - Job Hunt Platform

Ett verktyg för YH-studenter att hitta LIA eller jobb på ett effektivt sätt.

## Dokumentation

- **[Vecka 1-4 Teoretiska Frågor & VG-Resonemang](#teoretiska-frågor)** - Se nedan
- **[Kodkvalitet, Säkerhet & Testing](./IMPROVEMENTS.md)** - Detaljerad dokumentation av förbättringar

---

**Teoretiska frågor för vecka 1:**

**Hur/Varför uppkom React?**
React skapades av Facebook för att lösa problem med hantering av UI-komponenter på ett mer effektivt sätt, genom att introducera virtuell DOM för snabbare rendering.

**Vad är JSX?**
JSX är ett "syntax-socker" för att skriva JavaScript-kod som ser ut som HTML. Det används för att skapa React-komponenter.

**Vad är en komponent?**
En komponent i React är en återanvändbar enhet av UI som kan ha sin egen logik och rendering.

**Vad är props?**
Props är de värden som skickas från en förälderkomponent till en barnkomponent för att anpassa dess beteende eller rendering.

**Vad menas med one-way-dataflow?**
Data flödar alltid från föräldrakomponenter till barnkomponenter via props. Barnkomponenter kan inte ändra på den data de får, vilket gör flödet förutsägbart.

**Hur kan man använda sig av konditionell rendering i React?**
Man kan använda JavaScript-operatorer som if, ternary eller && för att rendera olika komponenter baserat på villkor.

**Vad menas med en återanvändbar komponent?**
En komponent som kan användas på flera ställen i appen utan att behöva duplicera koden.

**Teoretiska frågor för vecka 2:**

**Vad är state i React?**
State är en mekanism som gör det möjligt för komponenter att lagra och hantera dynamisk data som påverkar rendering.

**Vad är skillnaden mellan state och props?**
Props skickas från föräldern till barnet och är oföränderliga inom barnkomponenten, medan state är lokal data som kan ändras inom en komponent.

**Vad menas med en kontrollerad komponent i React?**
En kontrollerad komponent är en formkomponent vars värde kontrolleras av React via state.

**Vad är en callback handler?**
En funktion som skickas som en prop till en barnkomponent för att hantera vissa händelser som användarinteraktioner.

**Vad menas med "lifting state up"?**
När en barnkomponent behöver dela sin state med en föräldrakomponent, så lyfter föräldern upp state från barnen genom att hantera och skicka tillbaka data.

**Vad är syftet med useEffect-hook i React?**
useEffect används för att hantera sidoeffekter i en komponent, såsom att hämta data eller sätta upp event listeners.

**Vad är syftet kring den s.k dependency-arrayen i useEffect?**
Den bestämmer när effekten ska köras. Om en variabel i arrayen ändras, körs effekten om.

**Teoretiska frågor för vecka 3:**

**Fördelar och nackdelar med Next.js?**

**Fördelar:** SSR, SSG, automatisk routing, API-rutter, bildoptimering, snabb utveckling.

**Nackdelar:** Större inlärningströskel, mindre kontroll över servern.

**Vad är routing och hur fungerar det i Next.js jämfört med vanlig React?**

**Routing:** Hantering av URL:er och sidor.

**Vanlig React:** Använder bibliotek som react-router.

**Next.js:** Routing sker automatiskt baserat på filstruktur (t.ex. pages/index.js).

**Vad är Reacts ekosystem och några viktiga bibliotek?**

**Ekosystem:** Verktyg och bibliotek som används med React.

**Viktiga bibliotek:** React Router, Redux, React Query, Styled Components, React Testing Library.

**Vad gör useContext och vilket problem löser det?**

**useContext:** Tillåter att dela globalt tillstånd utan att skicka props genom alla komponenter.

**Problem det löser:** Prop drilling (skicka props genom många nivåer av komponenter).

**Teoretiska frågor för vecka 4:**

**Vad är Redux Toolkit?:** Redux Toolkit är det officiella verktyget från Redux-teamet för att förenkla användningen av Redux. Det minskar mängden kod och hjälper till att skriva ren, säker och effektiv state management i React-appar.

**När, i vilka situationer vill man använda Redux Toolkit?:** Redux andvänds när appens state blir för stort eller komplext för att hanteras med enbart useState eller useContext. Etc är när man använder en komplex global state som delas mellan många komponenter, Vill centralisera API-anrop, när man behöver tydlig struktur.

---

## VG-Resonemang: Styrkor och Brister i Kodens Genomförande

### Implementerade VG-Features

**1. React Hook Form** - Formulärvalidering och hantering i registrering, login och jobbskapande.

**2. Material UI (MUI) + date-fns** - Professionella UI-komponenter (Tabs) och tidsformatering för bättre användarupplevelse.

**3. JWT-baserad Autentisering & Authorization** - Säker inloggning med rollbaserad åtkomst (admin-funktionalitet).

**4. Fullstack Backend med Prisma & PostgreSQL** - Komplett databashantering med relationer och migrations.

---

### Styrkor i Kodimplementationen

#### 1. **TypeScript-integration & Type Safety**
Projektet använder TypeScript genomgående i både frontend och backend, vilket ger stark typsäkerhet och förhindrar många runtime-fel. Typedefinitioner för `Job`, `User`, och `FormData` gör koden mer förutsägbar och lättare att underhålla. Detta är särskilt värdefullt i större projekt där typsäkerhet kan förhindra buggar tidigt i utvecklingsprocessen.

#### 2. **State Management-arkitektur**
Kombinationen av Redux Toolkit för global state (sökfunktionalitet) och Context API för tema-hantering visar förståelse för när olika state management-lösningar är lämpliga. Redux används för komplex data som delas mellan komponenter, medan Context API används för enklare global state som tema. Detta är en bra separation of concerns.

#### 3. **Databasdesign med Prisma**
Prisma-schemat visar en väl genomtänkt databasstruktur med relationer mellan `User` och `Job` (både för skapade jobb och sparade jobb). Användningen av många-till-många-relation för `savedBy` är korrekt implementerad och visar förståelse för relationella databaser. Migrations-hanteringen garanterar versionskontroll av databasscheman.

#### 4. **Autentisering & Authorization**
JWT-baserad autentisering med rollbaserad åtkomst (admin kan skapa jobb) visar en professionell approach. Token lagras i localStorage och skickas med varje autentiserad förfrågan via Authorization-headers. Middleware för att verifiera tokens finns på backend-sidan.

#### 5. **Formulärhantering med React Hook Form**
React Hook Form används konsekvent i alla formulär, vilket ger bättre prestanda än kontrollerade komponenter med vanilla React state. Validering implementeras direkt i register-funktionen, och felmeddelanden visas på ett användarvänligt sätt.

#### 6. **Komponentstruktur och Återanvändbarhet**
Komponenter som `ThemeToggleButton` och `SkapaJobb` är väl separerade och återanvändbara. Användningen av props och conditional rendering i `jobb/page.tsx` med tab-navigation visar god komponentarkitektur.

#### 7. **Användarupplevelse (UX)**
- Realtidssökning med debouncing (300ms timeout) förhindrar onödiga API-anrop
- `date-fns` ger användarvänliga tidsstämplar ("2 days ago" istället för råa datum)
- Loading-states och felmeddelanden ger feedback till användaren
- Dark/light mode förbättrar tillgängligheten

---

### Brister och Förbättringsmöjligheter

#### 1. **Säkerhetsbrister**

**JWT i localStorage:** Tokens lagras i localStorage vilket är sårbart för XSS-attacker. En bättre lösning hade varit att använda HttpOnly cookies som är immuna mot JavaScript-baserade attacker. Detta är en kritisk säkerhetsbrist i produktionsmiljö.

**Lösenordshantering:** Det framgår inte tydligt om lösenord hashas med bcrypt eller liknande innan de sparas i databasen. Detta är absolut nödvändigt för säker användarhantering.

**CORS och API-säkerhet:** Ingen tydlig CORS-konfiguration eller rate limiting syns, vilket kan göra API:et sårbart för missbruk.

**Token Expiration:** Finns ingen tydlig hantering av token-utgång eller refresh tokens, vilket betyder att användare måste logga in igen manuellt när token går ut.

#### 2. **Kodduplicering och DRY-principen**

**Jobblistan renderas två gånger:** I `jobb/page.tsx` renderas jobbkorten nästan identiskt i både "Alla Jobb" och "Sparade Jobb"-tabben (rad 180-219 och 232-256). Detta bryter mot DRY-principen och borde abstraheras till en återanvändbar `JobCard`-komponent.

**API fetch-logik:** Liknande fetch-kod upprepas på flera ställen utan en centraliserad API-service. En `api.ts`-fil med helper-funktioner hade minskat duplicering och gjort felhantering enklare.

**Type definitions:** Job-typen definieras på flera ställen i olika filer, vilket riskerar inkonsistens. En gemensam `types.ts`-fil hade varit bättre.

#### 3. **Felhantering och Error Boundaries**

Appen saknar React Error Boundaries, vilket betyder att ett fel i en komponent kan krascha hela applikationen. Fel hanteras med `try-catch` men utan några robusta fallback-UI eller centraliserad error logging.

**Nätverksfel:** Om backend är nere visas bara ett generiskt felmeddelande. Bättre hade varit att visa användaren vad som gått fel och hur de kan lösa det.

**404-hantering:** Ingen custom 404-sida eller felhantering för routes som inte finns.

#### 4. **Prestanda och Optimering**

**Onödiga re-renders:** I `page.tsx` körs `useEffect` för sökning varje gång `searchTerm` ändras, även om användaren fortfarande skriver. Trots att det finns en debouncing med timeout, skapas nya timers vid varje render vilket inte är optimalt.

**Ingen bildoptimering:** Next.js Image-komponenten används inte för jobbloggor, vilket innebär att bilder inte optimeras automatiskt. Detta kan påverka laddningstider negativt.

**Prisma queries:** Alla jobb hämtas alltid från databasen, även vid sökningar. För större dataset skulle detta vara mycket ineffektivt. Bättre hade varit att använda Prisma's `where`-clause för filtrering direkt i databasen istället för att filtrera i JavaScript efter hämtning.

#### 5. **Testing**

Projektet saknar helt enhetstester och integrationstester. För en produktionsapp är detta en stor brist. React Testing Library och Jest borde användas för att testa:
- Komponenter (rendering, user interactions)
- Redux slices (reducers, actions)
- API endpoints (backend)
- Autentiseringsflöden

#### 6. **Separation of Concerns**

**Backend routes:** I `jobsRoutes.ts` finns all logik direkt i route-handlerna istället för i separata controllers. Det finns `jobsController.ts` men den används inte konsekvent. Detta gör koden svårare att testa och underhålla.

**Environment variables:** Ingen tydlig `.env.example` eller dokumentation om vilka environment variables som behövs. `JWT_SECRET` och databasanslutning borde ha tydlig dokumentation.

#### 7. **Tillgänglighet (Accessibility)**

Ingen användning av ARIA-attribut eller fokushantering för tangentbordsnavigation. Formulär saknar labels kopplade till inputs (används bara placeholders), vilket är dåligt för skärmläsare.

**Color contrast:** Dark/light mode implementerad men ingen kontroll av att färgkontraster uppfyller WCAG-standarder.

#### 8. **Databasoptimering**

**N+1 problem:** När jobb hämtas inkluderas `savedBy`-relationen för alla användare. För stora datasets kan detta bli en prestandaflaskhals. Bättre hade varit att bara hämta antal sparade eller en boolean för om den inloggade användaren sparat jobbet.

**Indexering:** Ingen tydlig indexering på kolumner som söks ofta (company, position, etc.), vilket kan påverka prestanda vid större datamängder.

---

### Sammanfattning och Lärdomar

Projektet visar på en stark förståelse för moderna React-patterns och fullstack-utveckling. De största styrkorna ligger i användningen av TypeScript, väl vald state management-arkitektur, och en professionell fullstack-implementation med autentisering.

De mest kritiska bristerna är säkerhetsaspekter (JWT i localStorage), kodduplicering (särskilt i jobbkort-rendering), och avsaknaden av tester. För att ta detta projekt till produktionsnivå skulle jag prioritera:

1. **Säkerhet:** HttpOnly cookies, bcrypt för lösenord, CORS-konfiguration
2. **Refaktorering:** Abstrahera återanvändbar JobCard-komponent, centraliserad API-service
3. **Testing:** Implementera enhetstester för kritiska funktioner
4. **Prestanda:** Databasfiltrering istället för JavaScript-filtrering, Next.js Image-komponenten
5. **Accessibility:** ARIA-attribut, proper labels, tangentbordsnavigation

Dessa insikter visar på en medvetenhet om att kod alltid kan förbättras och att mjukvaruutveckling är en kontinuerlig lärandeprocess där säkerhet, prestanda och maintainability måste balanseras mot utvecklingshastighet.