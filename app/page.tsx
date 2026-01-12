import Image from "next/image";
import WaitlistForm from "./components/WaitlistForm";
import DarkModeToggle from "./components/DarkModeToggle";
import Header from "./components/Header";

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
        <p className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-300">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl dark:text-zinc-100">{title}</h2>
      {desc ? <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">{desc}</p> : null}
    </div>
  );

  const Check = () => (
    <span
      aria-hidden
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Kommer snart • Early access åpner først
              </div>
            </FadeIn>

            <FadeIn delay="80ms">
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl dark:text-zinc-100">
                Last opp regningene dine.
                <br />
                Få bedre avtaler.
                <br />
                Spar penger.
              </h1>
            </FadeIn>

            <FadeIn delay="140ms">
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                Last opp en strøm- eller mobilfaktura.{" "}
                Se hva du betaler vs. beste pris i markedet.{" "}
                <span className="text-zinc-900 dark:text-zinc-100">Bytt når du vil</span> —{" "}
                <span className="text-zinc-900 dark:text-zinc-100">du bestemmer alltid selv</span>.
              </p>
            </FadeIn>

            <FadeIn delay="200ms">
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#venteliste"
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Få early access
                </a>
                <a
                  href="#hvordan"
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Se hvordan det funker
                </a>
              </div>

              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-300">
                Ingen auto-bytte. Ingen binding. Start med e-post. BankID kan komme senere.
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <TrustPill>Du bestemmer</TrustPill>
                <TrustPill>Du ser tallene</TrustPill>
                <TrustPill>Gratis i beta</TrustPill>
              </div>
            </FadeIn>
          </div>

          {/* Demo card */}
          <FadeIn delay="140ms">
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-zinc-100">Din oversikt</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-300">Sist sjekket: i dag (demo)</p>
                </div>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  transparent demo
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-300">Strøm</p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-300">Ingen binding</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold dark:text-zinc-100">1 149 kr/mnd</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">− 220 kr</p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-300">Beste alternativ: 929 kr/mnd</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-300">Mobil</p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-300">Binding: 0 mnd</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold dark:text-zinc-100">499 kr/mnd</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">− 120 kr</p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-300">Beste alternativ: 379 kr/mnd</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-zinc-300">Prognose</p>
                  <p className="mt-2 text-2xl font-semibold dark:text-zinc-100">4 080 kr/år</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-300">
                    Estimert besparelse hvis du bytter nå
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-500 dark:text-zinc-300">Slik blir det i praksis</p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  Last opp 1–2 fakturaer → vi leser tallene → du får forslag → du bytter når du vil.
                </p>
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
              title: "Tydelig besparelse",
              desc: "Du ser kroner per måned, per år og over tid.",
            },
            {
              title: "Du bestemmer",
              desc: "Ingen auto-bytte uten at du trykker “bytt”.",
            },
            {
              title: "Bygd for trygghet",
              desc: "Minimal data, tydelig policy, sporbarhet.",
            },
          ].map((x) => (
            <div key={x.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm font-medium dark:text-zinc-100">{x.title}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="hvordan">
        <SectionTitle
          eyebrow="3 steg"
          title="Hvordan funker det?"
          desc="Ingen skjemahelvete. Bare last opp og få forslag."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Last opp",
              desc: "PDF eller bilde av faktura. Vi henter ut pris, forbruk og leverandør.",
            },
            {
              n: "2",
              title: "Sammenlign",
              desc: "Vi matcher deg med billigere alternativer og regner besparelse over tid.",
            },
            {
              n: "3",
              title: "Bytt når du vil",
              desc: "Du får en enkel bytteflyt. Du godkjenner alltid selv.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {s.n}
              </div>
              <p className="mt-4 text-base font-semibold dark:text-zinc-100">{s.title}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Why believe */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="tillit">
        <SectionTitle
          eyebrow="Tillit først"
          title="Hvorfor stole på SmartBytt?"
          desc="Vi bygger dette på den mest conservative måten: minst mulig data, maks tydelighet."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold dark:text-zinc-100">Tydelig businessmodell</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Vi tjener kun når du faktisk bytter til noe bedre, eller hvis du velger Pro senere.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold dark:text-zinc-100">Ingen “magisk” autopilot</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              SmartBytt foreslår. Du godkjenner. Alltid.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold dark:text-zinc-100">Minimal data</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Vi henter bare det som trengs for å beregne pris og sparepotensial.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold dark:text-zinc-100">Slik bygger vi tillit</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Du skal kunne forstå produktet på 30 sek — og føle deg trygg.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <TrustPill>Transparent</TrustPill>
              <TrustPill>Bruker-kontroll</TrustPill>
              <TrustPill>Dataminimering</TrustPill>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Du ser hva som er lest fra fakturaen før noe lagres.",
              "Du kan slette dataene dine når som helst.",
              "Vi fokuserer på få kategorier først for høy presisjon.",
              "Ingenting byttes uten godkjenning fra deg.",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <Check />
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <SectionTitle
          eyebrow="Roadmap"
          title="Planen"
          desc="Vi bygger i riktig rekkefølge: oversikt først, bytteflyt etterpå."
        />

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Uke 1", desc: "Landing + venteliste" },
            { title: "Uke 2–4", desc: "MVP: last opp faktura → sparing" },
            { title: "Uke 5–8", desc: "Bytteflyt: strøm + mobil" },
            { title: "Etterpå", desc: "Autopilot: varsler + overvåkning" },
          ].map((x) => (
            <div key={x.title} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold dark:text-zinc-100">{x.title}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="sikkerhet">
          <SectionTitle
            eyebrow="Sikkerhet"
            title="Sikkerhet og kontroll"
            desc="Dette skal føles som Vipps-nivå på trygghet — ikke som en sketchy sammenligningstjeneste."
          />

          <div className="grid gap-4 md:grid-cols-2">
<div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
            <p className="text-sm font-semibold dark:text-zinc-100">Dataminimering</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Vi henter kun det som trengs for å beregne pris og sparepotensial.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
              <p className="text-sm font-semibold dark:text-zinc-100">Du eier valgene</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Ingen automatisk bytting uten at du godkjenner.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
              <p className="text-sm font-semibold dark:text-zinc-100">Tydelig policy</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Enkelt språk. Ingen skjulte “vi selger data”-triks.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
              <p className="text-sm font-semibold dark:text-zinc-100">Trygg onboarding</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Start med e-post i MVP. BankID kan komme senere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" id="venteliste">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 md:p-10 dark:border-zinc-800 dark:bg-zinc-900">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">Få early access</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Vi åpner i puljer. Ventelisten får først tilgang.
              </p>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-300">
                Early access = du får mulighet til å teste gratis analyse før lansering.
              </p>
              <div className="mt-5 grid gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check />
                  <span>Du kan melde deg av når som helst</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check />
                  <span>Ingen spam — kun oppdateringer om SmartBytt</span>
                </div>
              </div>
            </div>

            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 pb-12 md:pb-16" id="faq">
        <SectionTitle title="FAQ" desc="Svar på det folk faktisk lurer på." />

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              q: "Er dette trygt?",
              a: "SmartBytt er bygget for dataminimering og tydelighet. Du ser alltid hva som er lest fra fakturaen og hva vi foreslår.",
            },
            {
              q: "Bytter SmartBytt automatisk for meg?",
              a: "Nei. SmartBytt foreslår og gjør bytte enkelt, men du godkjenner alltid selv.",
            },
            {
              q: "Må jeg koble bank?",
              a: "Nei. MVP fungerer med opplasting av regninger. BankID/innsyn kan komme senere.",
            },
            {
              q: "Hva koster det?",
              a: "Første versjon fokuserer på gratis analyse. Senere kan Pro gi overvåkning og varsler.",
            },
            {
              q: "Hvordan tjener SmartBytt penger?",
              a: "Vi tjener provisjon når du bytter til en bedre avtale via oss. Ingen skjulte kostnader for deg.",
            },
            {
              q: "Hva skjer med dataene mine?",
              a: "Vi lagrer kun det som trengs for å beregne sparepotensial. Du kan slette alt når som helst.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold dark:text-zinc-100">{item.q}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">© {year} SmartBytt</p>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
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