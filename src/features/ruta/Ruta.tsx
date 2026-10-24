import { Link } from "react-router-dom";
import { UNIDADES } from "../../data/unidades";
import { PREGUNTAS } from "../../data/preguntas";
import { estadoUnidad, resumenRuta, useApp } from "../../lib/store";

const etiqueta = {
  nueva: { texto: "Nueva", color: "var(--muted)" },
  leida: { texto: "Leída", color: "var(--accent)" },
  "en-curso": { texto: "En curso", color: "var(--accent)" },
  dominada: { texto: "Dominada", color: "var(--ok)" },
} as const;

export default function Ruta() {
  const progreso = useApp((s) => s.unidades);
  const tarjetas = useApp((s) => s.tarjetas);
  const { dominadas, total } = resumenRuta(progreso);
  const pct = Math.round((dominadas / total) * 100);

  const porMateria = UNIDADES.reduce<Record<string, typeof UNIDADES>>((acc, u) => {
    (acc[u.materiaNombre] ??= []).push(u);
    return acc;
  }, {});

  const proxima =
    UNIDADES.find((u) => progreso[u.id]?.leida && !progreso[u.id]?.dominada) ??
    UNIDADES.find((u) => !progreso[u.id]?.leida);

  return (
    <div className="space-y-4">
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

      {Object.entries(porMateria).map(([materia, unidades]) => (
        <section key={materia} className="space-y-2">
          <h2 className="px-1 text-xs font-semibold tracking-wider text-muted uppercase">{materia}</h2>
          {unidades.map((u) => {
            const estado = estadoUnidad(u.id, progreso);
            const p = progreso[u.id];
            const preguntas = PREGUNTAS.filter((q) => u.preguntas.includes(q.id)).length;
            return (
              <Link
                key={u.id}
                to={`/unidad/${u.id}`}
                className="card flex items-center gap-3 p-4 active:scale-[0.99]"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full border text-xs font-bold"
                  style={{
                    borderColor: etiqueta[estado].color,
                    color: etiqueta[estado].color,
                  }}
                  aria-hidden
                >
                  {estado === "dominada" ? "✓" : estado === "nueva" ? "○" : "▶"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">{u.titulo}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <span style={{ color: etiqueta[estado].color }} className="font-semibold uppercase">
                      {etiqueta[estado].texto}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      Lección + {preguntas} preguntas
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
        <h2 className="text-sm font-semibold">¿Ya leíste todo?</h2>
        <p className="mt-1 text-xs text-muted">
          El repaso mezcla todas las materias con repetición espaciada. {Object.keys(tarjetas).length} de{" "}
          {PREGUNTAS.length} tarjetas vistas.
        </p>
        <Link to="/repaso" className="mt-3 block rounded-xl border border-line py-2.5 text-center text-sm text-ink">
          Ir a repaso
        </Link>
      </section>
    </div>
  );
}
