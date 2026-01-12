import Image from "next/image";
import Link from "next/link";
import DarkModeToggle from "./components/DarkModeToggle";
import Header from "./components/Header";
import WaitlistForm from "./components/WaitlistForm";

export default function Home() {
  const year = new Date().getFullYear();

  const TrustPill = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {children}
    </span>
  );

  const SectionTitle = ({
    eyebrow,
    title,
    desc,
    id,
  }: {
    eyebrow?: string;
    title: string;
    desc?: string;
    id?: string;
  }) => (
    <div id={id} className="mb-8">
      {eyebrow ? (
        <p className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl dark:text-zinc-100">{title}</h2>
      {desc ? <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{desc}</p> : null}
    </div>
  );

  const Check = () => (
    <span
      aria-hidden
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        <path
          d="M7.8 13.6 4.9 10.7l-1.2 1.2 4.1 4.1L16.4 7.4l-1.2-1.2z"
          fill="currentColor"
        />
      </svg>
    </span>
  );

  const SubtleGlow = () => (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-30"
    >
      <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-200 blur-3xl dark:bg-emerald-900" />
      <div className="absolute left-[10%] top-[260px] h-[260px] w-[260px] rounded-full bg-sky-200 blur-3xl dark:bg-sky-900" />
      <div className="absolute right-[8%] top-[320px] h-[280px] w-[280px] rounded-full bg-blue-200 blur-3xl dark:bg-blue-900" />
    </div>
  );

  const FadeIn = ({ children, delay = "0ms" }: { children: React.ReactNode; delay?: string }) => (
    <div
      className="animate-[fadeUp_700ms_ease-out_forwards] opacity-0"
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );

  return (
    <main className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <SubtleGlow />

      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-24">
        <div className="grid gap-8 md:gap-10 md:grid-cols-2 md:items-center">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Nå tilgjengelig • Ekte spotpriser fra Nord Pool
              </div>
            </FadeIn>

            <FadeIn delay="80ms">
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl dark:text-zinc-100">
                Sammenlign strømpriser.
                <br />
                Se hva du kan spare.
                <br />
                Bytt enkelt.
              </h1>
            </FadeIn>

            <FadeIn delay="140ms">
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                Legg inn din nåværende strømavtale og se umiddelbart hvor mye du kan spare.
                Vi henter ekte spotpriser fra Nord Pool og sammenligner med de beste tilbudene i markedet.
              </p>
            </FadeIn>

            <FadeIn delay="200ms">
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Kom i gang gratis
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Logg inn
                </Link>
              </div>

              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                Helt gratis. Ingen binding. Du bestemmer alltid selv om du vil bytte.
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <TrustPill>Ekte spotpriser</TrustPill>
                <TrustPill>Du bestemmer</TrustPill>
                <TrustPill>Gratis å bruke</TrustPill>
              </div>
            </FadeIn>
          </div>

          {/* Demo card */}
          <FadeIn delay="140ms">
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-zinc-100">Eksempel: Spar på strøm</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Basert på 16 000 kWh/år</p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  ⚡ Live priser
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Din nåværende avtale</p>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold dark:text-zinc-100">1 450 kr/mnd</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Spotpris + 4,9 øre</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Beste alternativ</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                      Anbefalt
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">1 180 kr/mnd</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Spar 270 kr</p>
                  </div>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">Spotpris + 1,5 øre • Ingen binding</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Årlig besparelse</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">3 240 kr</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Ved å bytte til beste tilbud
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick trust blocks */}
      <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-12 sm:gap-4 md:py-16 md:grid-cols-3">
          {[
            {
              title: "Ekte priser fra Nord Pool",
              desc: "Vi henter spotpriser time for time, så du alltid ser hva strømmen faktisk koster.",
            },
            {
              title: "Du har full kontroll",
              desc: "Vi foreslår bedre avtaler, men du bestemmer om og når du vil bytte.",
            },
            {
              title: "Enkelt å forstå",
              desc: "Se tydelig hva du betaler i dag, og hva du kan spare ved å bytte.",
            },
          ].map((x) => (
            <div key={x.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm font-medium dark:text-zinc-100">{x.title}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="hvordan">
        <SectionTitle
          eyebrow="3 enkle steg"
          title="Slik fungerer det"
          desc="Fra registrering til besparelse på under 5 minutter."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Legg inn avtalen din",
              desc: "Fortell oss hva du betaler i dag. Du kan legge inn manuelt eller laste opp en faktura.",
            },
            {
              n: "2",
              title: "Se hva du kan spare",
              desc: "Vi sammenligner med de beste tilbudene i markedet og viser deg besparelsen.",
            },
            {
              n: "3",
              title: "Bytt når du vil",
              desc: "Fant du noe bedre? Bytt enkelt med noen få klikk. Du godkjenner alltid selv.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {s.n}
              </div>
              <p className="mt-4 text-base font-semibold dark:text-zinc-100">{s.title}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="funksjoner">
        <SectionTitle
          eyebrow="Funksjoner"
          title="Alt du trenger for å spare på strøm"
          desc="Vi har bygget verktøyene som gjør det enkelt å ta kontroll over strømutgiftene."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "⚡",
              title: "Live spotpriser",
              desc: "Se strømprisen time for time. Data oppdateres fra hvakosterstrommen.no.",
            },
            {
              icon: "📊",
              title: "Sammenlign tilbud",
              desc: "Vi henter tilbud fra flere leverandører og beregner hva det faktisk koster deg.",
            },
            {
              icon: "💰",
              title: "Sparekalkulator",
              desc: "Se nøyaktig hvor mye du kan spare per måned og per år.",
            },
            {
              icon: "📱",
              title: "Fungerer på mobil",
              desc: "Sjekk strømpriser og sammenlign tilbud hvor som helst.",
            },
            {
              icon: "🔒",
              title: "Trygt og privat",
              desc: "Vi lagrer kun det som trengs. Du kan slette dataene dine når som helst.",
            },
            {
              icon: "🚀",
              title: "Mobil og bredbånd kommer",
              desc: "Snart kan du sammenligne mobilabonnement og bredbånd også.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-800">
                {f.icon}
              </div>
              <p className="mt-3 text-sm font-semibold dark:text-zinc-100">{f.title}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Why believe */}
      <section className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="tillit">
          <SectionTitle
            eyebrow="Trygghet først"
            title="Hvorfor velge SmartBytt?"
            desc="Vi har bygget tjenesten med fokus på åpenhet, kontroll og brukervennlighet."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
              <p className="text-sm font-semibold dark:text-zinc-100">Ingen skjulte kostnader</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                SmartBytt er gratis å bruke. Vi tjener kun hvis du faktisk bytter til en bedre avtale via oss.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
              <p className="text-sm font-semibold dark:text-zinc-100">Du bestemmer alltid</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Vi bytter aldri noe automatisk. Du ser forslagene og velger selv om du vil gjøre noe.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
              <p className="text-sm font-semibold dark:text-zinc-100">Ekte data</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Vi bruker ekte spotpriser fra Nord Pool, ikke estimater eller utdaterte tall.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold dark:text-zinc-100">Bygget for tillit</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Du skal forstå hva som skjer og føle deg trygg hele veien.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <TrustPill>Åpen prismodell</TrustPill>
                <TrustPill>Du har kontroll</TrustPill>
                <TrustPill>Minimal datalagring</TrustPill>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "Du ser alltid hva beregningene er basert på.",
                "Du kan slette kontoen og dataene dine når som helst.",
                "Vi fokuserer på én kategori om gangen for best mulig kvalitet.",
                "Ingen bytte skjer uten at du aktivt godkjenner det.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <Check />
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="venteliste">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 md:p-10 dark:border-zinc-800 dark:bg-zinc-900">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />

          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl dark:text-zinc-100">
                Bli med på ventelisten
              </h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Vi lanserer snart! Meld deg på for å få tidlig tilgang og eksklusive tilbud.
                Du er ikke forpliktet til noe.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <TrustPill>Gratis</TrustPill>
                <TrustPill>Ingen spam</TrustPill>
                <TrustPill>Tidlig tilgang</TrustPill>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800/50">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 md:p-10 dark:border-zinc-800 dark:bg-zinc-900">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />

          <div className="relative text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl dark:text-zinc-100">
              Klar til å spare på strømmen?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
              Det tar bare noen minutter å legge inn avtalen din og se hva du kan spare.
              Helt gratis, ingen forpliktelser.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Opprett gratis konto
              </Link>
              <Link
                href="#hvordan"
                className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                Les mer om hvordan det fungerer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 pb-12 md:pb-16" id="faq">
        <SectionTitle title="Ofte stilte spørsmål" desc="Svar på det folk lurer på." />

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              q: "Er SmartBytt gratis?",
              a: "Ja, det er helt gratis å bruke SmartBytt. Vi tjener kun provisjon hvis du faktisk bytter til en bedre avtale via oss.",
            },
            {
              q: "Bytter dere automatisk for meg?",
              a: "Nei, aldri. Vi viser deg hva du kan spare og gjør det enkelt å bytte, men du bestemmer alltid selv.",
            },
            {
              q: "Hvor kommer prisene fra?",
              a: "Vi henter ekte spotpriser fra hvakosterstrommen.no som får data direkte fra Nord Pool.",
            },
            {
              q: "Må jeg oppgi sensitive opplysninger?",
              a: "Nei, du trenger bare å oppgi forbruk og hva du betaler i dag. Du bestemmer selv hva du vil dele.",
            },
            {
              q: "Hva skjer med dataene mine?",
              a: "Vi lagrer kun det som trengs for å beregne sparepotensial. Du kan slette alt når som helst i innstillingene.",
            },
            {
              q: "Kommer det flere kategorier?",
              a: "Ja! Vi jobber med å legge til mobilabonnement og bredbånd. Strøm er først ut fordi det er der folk sparer mest.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold dark:text-zinc-100">{item.q}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">© {year} SmartBytt</p>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <a href="/personvern" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Personvern
            </a>
            <a href="/vilkar" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Vilkår
            </a>
            <a href="/kontakt" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Kontakt
            </a>
            <DarkModeToggle />
          </div>
        </div>
      </footer>
    </main>
  );
}
