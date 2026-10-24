import { Link } from "react-router-dom";
import { MATERIAS, PREGUNTAS } from "../../data/preguntas";
import { estadisticasHoy, pendientes, useApp } from "../../lib/store";

const meta = 10;

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default function Hoy() {
  const tarjetas = useApp((s) => s.tarjetas);
  const intentos = useApp((s) => s.intentos);

  const cola = pendientes(tarjetas);
  const hoy = estadisticasHoy(intentos);
  const nuevas = cola.filter((q) => !tarjetas[q.id]).length;
  const repasos = cola.length - nuevas;
  const estimado = Math.min(cola.length, meta);

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm text-muted">{saludo()}, Jefferson</p>
        <h2 className="mt-1 text-xl font-semibold">
          {cola.length === 0 ? "Todo repasado por hoy" : `Te quedan ${cola.length} tarjetas`}
        </h2>
      </section>

      <Link
        to="/sesion"
        className="card block p-5 transition-transform active:scale-[0.99]"
        style={{ borderColor: "var(--accent)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              Sesión de {estimado} tarjetas
            </p>
            <p className="mt-2 text-sm text-muted">
              {nuevas} nuevas · {repasos} por repasar
            </p>
            <p className="mt-1 text-sm text-muted">
              {hoy.respondidas > 0
                ? `Hoy: ${hoy.respondidas} respondidas, ${hoy.precision}% de acierto`
                : "Aún no has respondido nada hoy"}
            </p>
          </div>
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full text-xl font-bold"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            aria-hidden
          >
            ▶
          </span>
        </div>
      </Link>

      <section className="grid grid-cols-3 gap-2">
        {[
          { k: "Hoy", v: hoy.respondidas },
          { k: "Acierto", v: `${hoy.precision}%` },
          { k: "Total", v: intentos.length },
        ].map((s) => (
          <div key={s.k} className="card px-3 py-3 text-center">
            <p className="text-lg font-semibold text-ink">{s.v}</p>
            <p className="text-[11px] tracking-wide text-muted uppercase">{s.k}</p>
          </div>
        ))}
      </section>

      <section className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Cobertura por materia</h3>
        <ul className="space-y-2">
          {MATERIAS.map((m) => {
            const total = PREGUNTAS.filter((q) => q.materia === m.slug).length;
            const vistas = new Set(
              intentos.filter((i) => i.materia === m.slug).map((i) => i.preguntaId),
            ).size;
            const pct = Math.round((vistas / total) * 100);
            return (
              <li key={m.slug} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs text-muted">{m.nombre}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--accent)" }}
                  />
                </span>
                <span className="w-10 text-right text-[11px] text-muted">{vistas}/{total}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
