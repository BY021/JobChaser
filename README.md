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