import DarkModeToggle from "./components/DarkModeToggle";
import Header from "./components/Header";
import LandingContent from "./components/LandingContent";
import LandingFooter from "./components/LandingFooter";

export default function Home() {
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

  return (
    <main className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <SubtleGlow />
      <Header />
      <LandingContent />
      <LandingFooter />
    </main>
  );
}
