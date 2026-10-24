import { useState } from "react";
import { Link } from "react-router-dom";
import { unidadesPorPrograma } from "../../data/unidades";
import { PREGUNTAS } from "../../data/preguntas";
import { estadoUnidad, resumenRuta, useApp } from "../../lib/store";

type Programa = "dam" | "fullstack";

const etiqueta = {
  nueva: { texto: "Nueva", color: "var(--muted)", icono: "○" },
  leida: { texto: "Leída", color: "var(--accent)", icono: "▶" },
  "en-curso": { texto: "En curso", color: "var(--accent)", icono: "▶" },
  dominada: { texto: "Dominada", color: "var(--ok)", icono: "✓" },
} as const;

const programas: { id: Programa; nombre: string; sub: string }[] = [
  { id: "dam", nombre: "Prueba DAM", sub: "Examen 3015" },
  { id: "fullstack", nombre: "Full stack", sub: "Del bit a producción" },
];

export default function Ruta() {
  const progreso = useApp((s) => s.unidades);
  const tarjetas = useApp((s) => s.tarjetas);
  const [programa, setPrograma] = useState<Programa>(
    (localStorage.getItem("fsckdy:programa") as Programa) || "dam",
  );

  const cambiar = (p: Programa) => {
    localStorage.setItem("fsckdy:programa", p);
    setPrograma(p);
  };

  const unidades = unidadesPorPrograma(programa);
  const { dominadas, total } = resumenRuta(progreso, programa);
  const pct = Math.round((dominadas / total) * 100);

  const porMateria = unidades.reduce<Record<string, typeof unidades>>((acc, u) => {
    (acc[u.materiaNombre] ??= []).push(u);
    return acc;
  }, {});

  const proxima =
    unidades.find((u) => progreso[u.id]?.leida && !progreso[u.id]?.dominada) ??
    unidades.find((u) => !progreso[u.id]?.leida);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface p-1">
        {programas.map((p) => (
          <button
            key={p.id}
            onClick={() => cambiar(p.id)}
            className={`rounded-lg px-3 py-2 text-left transition-colors ${
              programa === p.id ? "bg-surface-2" : ""
            }`}
          >
            <span className={`block text-sm font-semibold ${programa === p.id ? "text-accent" : "text-muted"}`}>
              {p.nombre}
            </span>
            <span className="block text-[10px] text-muted">{p.sub}</span>
          </button>
        ))}
      </div>

      <section className="card p-5">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0">
            <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="var(--accent)" strokeWidth="4"
                strokeDasharray={`${(pct / 100) * 97.4} 97.4`} strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-sm font-bold">{pct}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs tracking-wider text-muted uppercase">Tu ruta</p>
            <p className="text-lg font-semibold">{dominadas} de {total} unidades</p>
            <p className="text-xs text-muted">Dominar = 80% o más en el quiz</p>
          </div>
        </div>
        {proxima && (
          <Link
            to={`/unidad/${proxima.id}`}
            className="mt-4 block rounded-xl bg-accent py-3 text-center text-sm font-semibold text-accent-ink"
          >
            {progreso[proxima.id]?.leida ? "Continuar" : "Empezar"}: {proxima.titulo}
          </Link>
        )}
      </section>

      {Object.entries(porMateria).map(([materia, lista]) => (
        <section key={materia} className="space-y-2">
          <h2 className="px-1 text-xs font-semibold tracking-wider text-muted uppercase">{materia}</h2>
          {lista.map((u) => {
            const estado = estadoUnidad(u.id, progreso);
            const p = progreso[u.id];
            const cuantas = PREGUNTAS.filter((q) => u.preguntas.includes(q.id)).length;
            return (
              <Link key={u.id} to={`/unidad/${u.id}`} className="card flex items-center gap-3 p-4 active:scale-[0.99]">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full border text-xs font-bold"
                  style={{ borderColor: etiqueta[estado].color, color: etiqueta[estado].color }}
                  aria-hidden
                >
                  {etiqueta[estado].icono}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">{u.titulo}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                    <span style={{ color: etiqueta[estado].color }} className="font-semibold uppercase">
                      {etiqueta[estado].texto}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      Lección + {cuantas} preguntas
                      {p?.mejor ? ` · mejor ${Math.round(p.mejor * 100)}%` : ""}
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </section>
      ))}

      <section className="card p-4">
        <h2 className="text-sm font-semibold">Repaso mezclado</h2>
        <p className="mt-1 text-xs text-muted">
          Repetición espaciada con todo lo que ya viste, sin importar el programa.{" "}
          {Object.keys(tarjetas).length} de {PREGUNTAS.length} tarjetas vistas.
        </p>
        <Link to="/repaso" className="mt-3 block rounded-xl border border-line py-2.5 text-center text-sm text-ink">
          Ir a repaso
        </Link>
      </section>
    </div>
  );
}
