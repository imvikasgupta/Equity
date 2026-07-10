import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

function EquityMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M3 17.5L9.2 11.3L13 15.1L21 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7H21V13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-4 z-40 flex justify-center px-4 md:top-5">
      <header
        className={cn(
          "w-full max-w-7xl rounded-2xl border transition-all duration-300 ease-out",
          "border-white/[0.08]",
        )}
        style={{
          backgroundColor: scrolled
            ? "rgba(20, 20, 24, 0.55)"
            : "rgba(20, 20, 24, 0.35)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          boxShadow: scrolled
            ? "0 10px 44px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex h-[62px] items-center justify-between px-5 md:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-transform duration-[250ms] ease-out hover:scale-[1.05]"
            style={{ letterSpacing: "0.02em" }}
          >
            <EquityMark
              className="h-[26px] w-[26px] text-white transition-[filter] duration-[250ms] group-hover:[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.55))]"
            />
            <span className="text-[17px] font-semibold text-white">Equity</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group relative rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-all duration-200",
                    active
                      ? "text-white"
                      : "text-white/65 hover:text-white hover:opacity-100",
                  )}
                >
                  <span className="relative">
                    {item.label}
                    <span
                      className={cn(
                        "pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left rounded-full bg-white/70 transition-transform duration-300 ease-out",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/5 hover:text-white md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/[0.06] px-3 pb-3 pt-2 md:hidden">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "block rounded-xl px-4 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>
    </div>
  );
}
