import Image from "next/image";
import WaitlistForm from "./components/WaitlistForm";

export default function Home() {
  const year = new Date().getFullYear();

  const TrustPill = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
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
        <p className="text-xs font-medium tracking-wide text-zinc-500">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {desc ? <p className="mt-2 max-w-2xl text-sm text-zinc-600">{desc}</p> : null}
    </div>
  );

  const Check = () => (
    <span
      aria-hidden
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900"
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
      className="pointer-events-none absolute inset-0 -z-10 opacity-70"
    >
      <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-200 blur-3xl" />
      <div className="absolute left-[10%] top-[260px] h-[260px] w-[260px] rounded-full bg-sky-200 blur-3xl" />
      <div className="absolute right-[8%] top-[320px] h-[280px] w-[280px] rounded-full bg-violet-200 blur-3xl" />
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
    <main className="relative min-h-screen bg-white text-zinc-900">
      {/* Simple keyframes without any libs */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>

      <SubtleGlow />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#" className="group flex items-center gap-2.5">
            <Image
              src="/brand/smartbytt-icon-64.png"
              alt="SmartBytt"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="text-sm font-semibold tracking-tight">
              SmartBytt <span className="text-zinc-400">beta</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
            <a href="#hvordan" className="hover:text-zinc-900">
              Hvordan funker det
            </a>
            <a href="#tillit" className="hover:text-zinc-900">
              Tillit
            </a>
            <a href="#faq" className="hover:text-zinc-900">
              FAQ
            </a>
          </nav>

          <a
            href="#venteliste"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Få early access
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Kommer snart • Early access åpner først
              </div>
            </FadeIn>

            <FadeIn delay="80ms">
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Last opp regningene dine.
                <br />
                Få bedre avtaler.
                <br />
                Spar penger.
              </h1>
            </FadeIn>

            <FadeIn delay="140ms">
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
                SmartBytt analyserer regningene dine og viser nøyaktig hva du kan spare på{" "}
                <span className="text-zinc-900">strøm</span>,{" "}
                <span className="text-zinc-900">mobil</span> og{" "}
                <span className="text-zinc-900">bredbånd</span>.
                Du får forslag og en enkel bytteflyt —{" "}
                <span className="text-zinc-900">du godkjenner alltid selv</span>.
              </p>
            </FadeIn>

            <FadeIn delay="200ms">
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#venteliste"
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Få early access
                </a>
                <a
                  href="#hvordan"
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  Se hvordan det funker
                </a>
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Ingen auto-bytte. Ingen binding. Start med e-post. BankID kan komme senere.
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <TrustPill>Gratis analyse i MVP</TrustPill>
                <TrustPill>Du ser tallene</TrustPill>
                <TrustPill>Du bestemmer</TrustPill>
              </div>
            </FadeIn>
          </div>

          {/* Demo card */}
          <FadeIn delay="140ms">
            <div className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white to-zinc-50" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Din oversikt</p>
                  <p className="mt-1 text-xs text-zinc-500">Sist sjekket: i dag (demo)</p>
                </div>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
                  transparent demo
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">Strøm</p>
                    <span className="text-xs text-zinc-500">Ingen binding</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold">1 149 kr/mnd</p>
                    <p className="text-sm font-medium text-emerald-600">− 220 kr</p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">Beste alternativ: 929 kr/mnd</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">Mobil</p>
                    <span className="text-xs text-zinc-500">Binding: 0 mnd</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold">499 kr/mnd</p>
                    <p className="text-sm font-medium text-emerald-600">− 120 kr</p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">Beste alternativ: 379 kr/mnd</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs text-zinc-500">Prognose</p>
                  <p className="mt-2 text-2xl font-semibold">4 080 kr/år</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Estimert besparelse hvis du bytter nå
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-500">Slik blir det i praksis</p>
                <p className="mt-2 text-sm text-zinc-700">
                  Last opp 1–2 fakturaer → vi leser tallene → du får forslag → du bytter når du vil.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick trust blocks */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
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
            <div key={x.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm font-medium">{x.title}</p>
              <p className="mt-2 text-sm text-zinc-600">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16" id="hvordan">
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
            <div key={s.n} className="rounded-3xl border border-zinc-200 bg-white p-6">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white">
                {s.n}
              </div>
              <p className="mt-4 text-base font-semibold">{s.title}</p>
              <p className="mt-2 text-sm text-zinc-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Why believe */}
      <section className="mx-auto max-w-6xl px-4 py-16" id="tillit">
        <SectionTitle
          eyebrow="Tillit først"
          title="Hvorfor stole på SmartBytt?"
          desc="Vi bygger dette på den mest conservative måten: minst mulig data, maks tydelighet."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-sm font-semibold">Tydelig businessmodell</p>
            <p className="mt-2 text-sm text-zinc-600">
              Vi tjener kun når du faktisk bytter til noe bedre, eller hvis du velger Pro senere.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-sm font-semibold">Ingen “magisk” autopilot</p>
            <p className="mt-2 text-sm text-zinc-600">
              SmartBytt foreslår. Du godkjenner. Alltid.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-sm font-semibold">Minimal data</p>
            <p className="mt-2 text-sm text-zinc-600">
              Vi henter bare det som trengs for å beregne pris og sparepotensial.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Slik bygger vi tillit</p>
              <p className="mt-1 text-sm text-zinc-600">
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
              <div key={t} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <Check />
                <p className="text-sm text-zinc-700">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mx-auto max-w-6xl px-4 py-16">
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
            <div key={x.title} className="rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-semibold">{x.title}</p>
              <p className="mt-2 text-sm text-zinc-600">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-16" id="sikkerhet">
          <SectionTitle
            eyebrow="Sikkerhet"
            title="Sikkerhet og kontroll"
            desc="Dette skal føles som Vipps-nivå på trygghet — ikke som en sketchy sammenligningstjeneste."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-semibold">Dataminimering</p>
              <p className="mt-2 text-sm text-zinc-600">
                Vi henter kun det som trengs for å beregne pris og sparepotensial.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-semibold">Du eier valgene</p>
              <p className="mt-2 text-sm text-zinc-600">
                Ingen automatisk bytting uten at du godkjenner.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-semibold">Tydelig policy</p>
              <p className="mt-2 text-sm text-zinc-600">
                Enkelt språk. Ingen skjulte “vi selger data”-triks.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-semibold">Trygg onboarding</p>
              <p className="mt-2 text-sm text-zinc-600">
                Start med e-post i MVP. BankID kan komme senere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="mx-auto max-w-6xl px-4 py-16" id="venteliste">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 md:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Få early access</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Vi åpner i puljer. Ventelisten får først tilgang.
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                Early access = du får mulighet til å teste gratis analyse før lansering.
              </p>
              <div className="mt-5 grid gap-2 text-xs text-zinc-600">
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
      <section className="mx-auto max-w-6xl px-4 pb-16" id="faq">
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
          ].map((item) => (
            <div key={item.q} className="rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-semibold">{item.q}</p>
              <p className="mt-2 text-sm text-zinc-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-600">© {year} SmartBytt</p>
          <div className="flex gap-4 text-sm text-zinc-600">
            <a href="/personvern" className="hover:text-zinc-900">
              Personvern
            </a>
            <a href="/vilkar" className="hover:text-zinc-900">
              Vilkår
            </a>
            <a href="/kontakt" className="hover:text-zinc-900">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}