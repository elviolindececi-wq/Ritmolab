"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Music2, X, BookOpen, Video, Dumbbell, User } from "lucide-react";

// ─── 4 links principales + perfil ────────────────────────────────────────────
const mainLinks = [
  { label: "Aprender", href: "/learn", icon: BookOpen },
  { label: "Videos", href: "/videos", icon: Video },
  { label: "Bimanual", href: "/bimanual", icon: Dumbbell },
];

// Links secundarios — solo en el menú mobile
const secondaryLinks = [
  { label: "Práctica", href: "/practice" },
  { label: "Modo libre", href: "/free-practice" },
  { label: "Metrónomo", href: "/metronome" },
  { label: "Ranking", href: "/leaderboard" },
  { label: "Mi perfil", href: "/profile" },
  { label: "¿Qué es?", href: "/about" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function close() { setOpen(false); }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/96 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-black" onClick={close}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white shadow-button">
              <Music2 size={22} />
            </span>
            <span className="hidden text-xl sm:block">RitmoLab</span>
          </Link>

          {/* Desktop nav — 3 main links */}
          <nav className="hidden items-center gap-1 md:flex">
            {mainLinks.map(({ label, href }) => (
              <Link key={href} href={href}
                className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${pathname === href || pathname.startsWith(href + "/") ? "bg-brand-100 text-brand-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/auth"
              className="hidden text-sm font-black text-brand-700 hover:text-brand-900 sm:block">
              Entrar
            </Link>
            <Link href="/dashboard"
              className="btn-primary px-4 py-2 text-sm">
              Mi progreso
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(o => !o)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-brand-100 bg-white md:hidden"
              aria-label="Menú"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={close}>
          <div className="absolute inset-0 bg-zinc-900/40" />
          <nav
            className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex h-16 items-center justify-between border-b border-brand-100 px-5">
              <Link href="/" onClick={close} className="flex items-center gap-2 font-black">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-white">
                  <Music2 size={16} />
                </span>
                RitmoLab
              </Link>
              <button onClick={close} className="grid h-9 w-9 place-items-center rounded-xl border border-brand-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              {/* Main links */}
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-400 px-2">Principal</p>
              <div className="space-y-1 mb-4">
                {mainLinks.map(({ label, href, icon: Icon }) => (
                  <Link key={href} href={href} onClick={close}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-black transition ${pathname === href ? "bg-brand-500 text-white" : "text-zinc-700 hover:bg-brand-50"}`}>
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Secondary links */}
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-400 px-2">Más</p>
              <div className="space-y-1 mb-4">
                {secondaryLinks.map(({ label, href }) => (
                  <Link key={href} href={href} onClick={close}
                    className={`flex items-center rounded-2xl px-4 py-3 font-bold transition ${pathname === href ? "bg-brand-100 text-brand-800" : "text-zinc-600 hover:bg-zinc-50"}`}>
                    {label}
                  </Link>
                ))}
              </div>

              {/* Auth */}
              <div className="border-t border-brand-100 pt-4 space-y-2">
                <Link href="/auth" onClick={close}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 font-black text-brand-700 hover:bg-brand-50 transition">
                  <User size={18} /> Entrar
                </Link>
                <Link href="/dashboard" onClick={close} className="btn-primary w-full justify-center">
                  Mi progreso
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
