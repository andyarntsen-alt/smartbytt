"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MobileNavProps {
  isLoggedIn?: boolean;
}

// Wrapper component for anchor links that closes menu on click
function NavAnchor({ 
  href, 
  children, 
  onNavigate 
}: { 
  href: string; 
  children: React.ReactNode; 
  onNavigate: () => void;
}) {
  const handleClick = () => {
    onNavigate();
    // Scroll to the element after closing menu
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      {children}
    </button>
  );
}

// Wrapper for navigation buttons
function NavButton({ 
  href, 
  children, 
  onNavigate,
  variant = "primary"
}: { 
  href: string; 
  children: React.ReactNode; 
  onNavigate: () => void;
  variant?: "primary" | "secondary" | "outline";
}) {
  const router = useRouter();
  const baseStyles = "block w-full rounded-xl px-4 py-3 text-center text-sm font-medium";
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "mt-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
  };

  const handleClick = () => {
    onNavigate();
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function MobileNav({ isLoggedIn = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label={isOpen ? "Lukk meny" : "Åpne meny"}
        aria-expanded={isOpen}
      >
        <svg
          className="h-5 w-5 text-zinc-600 dark:text-zinc-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            <NavAnchor href="#hvordan" onNavigate={closeMenu}>
              Hvordan funker det
            </NavAnchor>
            <NavAnchor href="#tillit" onNavigate={closeMenu}>
              Tillit
            </NavAnchor>
            <NavAnchor href="#faq" onNavigate={closeMenu}>
              FAQ
            </NavAnchor>
            
            <div className="mt-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              {isLoggedIn ? (
                <>
                  <NavButton href="/dashboard" onNavigate={closeMenu} variant="secondary">
                    Gå til dashboard
                  </NavButton>
                  <NavButton href="/dashboard/innstillinger" onNavigate={closeMenu} variant="outline">
                    Innstillinger
                  </NavButton>
                </>
              ) : (
                <>
                  <NavButton href="/register" onNavigate={closeMenu} variant="primary">
                    Kom i gang
                  </NavButton>
                  <NavButton href="/login" onNavigate={closeMenu} variant="outline">
                    Logg inn
                  </NavButton>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
