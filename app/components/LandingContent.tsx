"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageToggle";
import { translations } from "@/lib/translations";
import WaitlistForm from "./WaitlistForm";

export default function LandingContent() {
  const { language } = useLanguage();
  const t = translations[language];

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

  const FadeIn = ({ children, delay = "0ms" }: { children: React.ReactNode; delay?: string }) => (
    <div
      className="animate-[fadeUp_700ms_ease-out_forwards] opacity-0"
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );

  const trustCheckItems = language === "no" 
    ? [
        "Du ser alltid hva beregningene er basert på.",
        "Du kan slette kontoen og dataene dine når som helst.",
        "Vi fokuserer på én kategori om gangen for best mulig kvalitet.",
        "Ingen bytte skjer uten at du aktivt godkjenner det.",
      ]
    : [
        "You always see what calculations are based on.",
        "You can delete your account and data anytime.",
        "We focus on one category at a time for best quality.",
        "No switch happens without your active approval.",
      ];

  const faqItems = language === "no"
    ? [
        { q: "Er SmartBytt gratis?", a: "Ja, det er helt gratis å bruke SmartBytt. Vi tjener kun provisjon hvis du faktisk bytter til en bedre avtale via oss." },
        { q: "Bytter dere automatisk for meg?", a: "Nei, aldri. Vi viser deg hva du kan spare og gjør det enkelt å bytte, men du bestemmer alltid selv." },
        { q: "Hvor kommer prisene fra?", a: "Vi henter ekte spotpriser fra hvakosterstrommen.no som får data direkte fra Nord Pool." },
        { q: "Må jeg oppgi sensitive opplysninger?", a: "Nei, du trenger bare å oppgi forbruk og hva du betaler i dag. Du bestemmer selv hva du vil dele." },
        { q: "Hva skjer med dataene mine?", a: "Vi lagrer kun det som trengs for å beregne sparepotensial. Du kan slette alt når som helst i innstillingene." },
        { q: "Kommer det flere kategorier?", a: "Ja! Vi jobber med å legge til mobilabonnement og bredbånd. Strøm er først ut fordi det er der folk sparer mest." },
      ]
    : [
        { q: "Is SmartBytt free?", a: "Yes, SmartBytt is completely free to use. We only earn commission if you actually switch to a better deal through us." },
        { q: "Do you switch automatically for me?", a: "No, never. We show you what you can save and make it easy to switch, but you always decide yourself." },
        { q: "Where do the prices come from?", a: "We fetch real spot prices from hvakosterstrommen.no which gets data directly from Nord Pool." },
        { q: "Do I need to provide sensitive information?", a: "No, you only need to provide consumption and what you pay today. You decide what you want to share." },
        { q: "What happens to my data?", a: "We only store what's needed to calculate savings potential. You can delete everything anytime in settings." },
        { q: "Are more categories coming?", a: "Yes! We're working on adding mobile plans and broadband. Electricity comes first because that's where people save the most." },
      ];

  const trustSectionContent = language === "no"
    ? {
        eyebrow: "Trygghet først",
        title: "Hvorfor velge SmartBytt?",
        desc: "Vi har bygget tjenesten med fokus på åpenhet, kontroll og brukervennlighet.",
        cards: [
          { title: "Ingen skjulte kostnader", desc: "SmartBytt er gratis å bruke. Vi tjener kun hvis du faktisk bytter til en bedre avtale via oss." },
          { title: "Du bestemmer alltid", desc: "Vi bytter aldri noe automatisk. Du ser forslagene og velger selv om du vil gjøre noe." },
          { title: "Ekte data", desc: "Vi bruker ekte spotpriser fra Nord Pool, ikke estimater eller utdaterte tall." },
        ],
        builtForTrust: "Bygget for tillit",
        builtForTrustDesc: "Du skal forstå hva som skjer og føle deg trygg hele veien.",
        pills: ["Åpen prismodell", "Du har kontroll", "Minimal datalagring"],
      }
    : {
        eyebrow: "Safety first",
        title: "Why choose SmartBytt?",
        desc: "We've built the service with focus on transparency, control and user-friendliness.",
        cards: [
          { title: "No hidden costs", desc: "SmartBytt is free to use. We only earn if you actually switch to a better deal through us." },
          { title: "You always decide", desc: "We never switch anything automatically. You see the suggestions and choose if you want to act." },
          { title: "Real data", desc: "We use real spot prices from Nord Pool, not estimates or outdated numbers." },
        ],
        builtForTrust: "Built for trust",
        builtForTrustDesc: "You should understand what's happening and feel safe along the way.",
        pills: ["Transparent pricing", "You're in control", "Minimal data storage"],
      };

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-24">
        <div className="grid gap-8 md:gap-10 md:grid-cols-2 md:items-center">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.hero.badge}
              </div>
            </FadeIn>

            <FadeIn delay="80ms">
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl dark:text-zinc-100">
                {t.hero.title1}
                <br />
                {t.hero.title2}
                <br />
                {t.hero.title3}
              </h1>
            </FadeIn>

            <FadeIn delay="140ms">
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t.hero.description}
              </p>
            </FadeIn>

            <FadeIn delay="200ms">
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {t.hero.cta}
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {t.hero.ctaSecondary}
                </Link>
              </div>

              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                {t.hero.disclaimer}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <TrustPill>{t.hero.pills.realPrices}</TrustPill>
                <TrustPill>{t.hero.pills.youDecide}</TrustPill>
                <TrustPill>{t.hero.pills.freeToUse}</TrustPill>
              </div>
            </FadeIn>
          </div>

          {/* Demo card */}
          <FadeIn delay="140ms">
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-zinc-100">{t.demo.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.demo.subtitle}</p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  {t.demo.livePrices}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.demo.currentDeal}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold dark:text-zinc-100">1 450 kr/{language === "no" ? "mnd" : "mo"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{language === "no" ? "Spotpris + 4,9 øre" : "Spot price + 4.9 øre"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.demo.bestAlternative}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                      {t.demo.recommended}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">1 180 kr/{language === "no" ? "mnd" : "mo"}</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{language === "no" ? "Spar 270 kr" : "Save 270 kr"}</p>
                  </div>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">{language === "no" ? "Spotpris + 1,5 øre • Ingen binding" : "Spot price + 1.5 øre • No commitment"}</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.demo.yearlySavings}</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">3 240 kr</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.demo.bySwitching}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick trust blocks */}
      <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-12 sm:gap-4 md:py-16 md:grid-cols-3">
          {t.trustBlocks.map((x) => (
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
          eyebrow={t.howItWorks.eyebrow}
          title={t.howItWorks.title}
          desc={t.howItWorks.desc}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {t.howItWorks.steps.map((s, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {i + 1}
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
          eyebrow={t.features.eyebrow}
          title={t.features.title}
          desc={t.features.desc}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f) => (
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
            eyebrow={trustSectionContent.eyebrow}
            title={trustSectionContent.title}
            desc={trustSectionContent.desc}
          />

          <div className="grid gap-4 md:grid-cols-3">
            {trustSectionContent.cards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800">
                <p className="text-sm font-semibold dark:text-zinc-100">{card.title}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold dark:text-zinc-100">{trustSectionContent.builtForTrust}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{trustSectionContent.builtForTrustDesc}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {trustSectionContent.pills.map((pill) => (
                  <TrustPill key={pill}>{pill}</TrustPill>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {trustCheckItems.map((text) => (
                <div key={text} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <Check />
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{text}</p>
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
                {t.waitlist.title}
              </h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {t.waitlist.desc}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.waitlist.pills.map((pill) => (
                  <TrustPill key={pill}>{pill}</TrustPill>
                ))}
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
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
              {t.cta.desc}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t.cta.button}
              </Link>
              <Link
                href="#hvordan"
                className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {t.cta.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 pb-12 md:pb-16" id="faq">
        <SectionTitle 
          title={language === "no" ? "Ofte stilte spørsmål" : "Frequently asked questions"} 
          desc={language === "no" ? "Svar på det folk lurer på." : "Answers to common questions."} 
        />

        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.q} className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold dark:text-zinc-100">{item.q}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
