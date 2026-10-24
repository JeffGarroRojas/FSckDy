import { NavLink, Outlet } from "react-router-dom";
import { calcularRacha } from "../lib/db";
import { useApp } from "../lib/store";

const tabs = [
  { to: "/", label: "Hoy", icon: "◉" },
  { to: "/progreso", label: "Progreso", icon: "▤" },
  { to: "/banco", label: "Banco", icon: "▦" },
  { to: "/ajustes", label: "Ajustes", icon: "⚙" },
];

export default function Layout() {
  const tema = useApp((s) => s.tema);
  const intentos = useApp((s) => s.intentos);
  const racha = calcularRacha(intentos);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">DAM 2026</p>
          <h1 className="text-2xl font-bold text-ink">FSckDy</h1>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm"
          title="Días seguidos estudiando"
        >
          <span aria-hidden>{tema === "oscuro" ? "🔥" : "🌱"}</span>
          <span className="font-semibold text-accent">{racha}</span>
        </div>
      </header>

      <main className="flex-1 px-5 pb-28">
        <Outlet />
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-surface/95 backdrop-blur">
        <ul className="grid grid-cols-4">
          {tabs.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                    isActive ? "text-accent" : "text-muted"
                  }`
                }
              >
                <span aria-hidden className="text-base leading-none">{t.icon}</span>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
