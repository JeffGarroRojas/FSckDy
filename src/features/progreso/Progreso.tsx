import { MATERIAS, PREGUNTAS } from "../../data/preguntas";
import { calcularRacha, claveDia, inicioDelDia } from "../../lib/db";
import { DIA } from "../../lib/sm2";
import { progresoPorMateria, useApp } from "../../lib/store";

export default function Progreso() {
  const intentos = useApp((s) => s.intentos);
  const tarjetas = useApp((s) => s.tarjetas);
  const racha = calcularRacha(intentos);

  const porMateria = progresoPorMateria(intentos);
  const total = intentos.length;
  const aciertos = intentos.filter((i) => i.correcta).length;
  const precision = total ? Math.round((aciertos / total) * 100) : 0;
  const dominadas = Object.values(tarjetas).filter((t) => t.reps >= 3).length;

  const conteo = new Map<string, number>();
  for (const i of intentos) conteo.set(claveDia(i.ts), (conteo.get(claveDia(i.ts)) ?? 0) + 1);

  const hoy = inicioDelDia();
  const dias = Array.from({ length: 30 }, (_, k) => {
    const ts = hoy - (29 - k) * DIA;
    return { ts, n: conteo.get(claveDia(ts)) ?? 0 };
  });
  const maximo = Math.max(1, ...dias.map((d) => d.n));

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-2">
        <div className="card p-4">
          <p className="text-2xl font-bold text-accent">{racha}</p>
          <p className="text-[11px] tracking-wide text-muted uppercase">Racha (días)</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{precision}%</p>
          <p className="text-[11px] tracking-wide text-muted uppercase">Precisión</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-[11px] tracking-wide text-muted uppercase">Respuestas</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{dominadas}</p>
          <p className="text-[11px] tracking-wide text-muted uppercase">Dominadas</p>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="mb-3 text-sm font-semibold">Últimos 30 días</h3>
        <div className="flex gap-1">
          {dias.map((d) => {
            const intensidad = d.n === 0 ? 0 : 0.25 + (d.n / maximo) * 0.75;
            return (
              <div
                key={d.ts}
                title={`${claveDia(d.ts)}: ${d.n} respuestas`}
                className="h-8 flex-1 rounded-sm"
                style={{
                  background: d.n === 0 ? "var(--surface-2)" : "var(--accent)",
                  opacity: d.n === 0 ? 1 : intensidad,
                }}
              />
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted">Cada barra es un día. Altura del color = actividad.</p>
      </section>

      <section className="card p-4">
        <h3 className="mb-3 text-sm font-semibold">Por materia</h3>
        <ul className="space-y-3">
          {MATERIAS.map((m) => {
            const d = porMateria.get(m.slug);
            const pct = d ? Math.round((d.aciertos / d.total) * 100) : 0;
            const vistas = Math.round(((d?.total ?? 0) / PREGUNTAS.filter((q) => q.materia === m.slug).length) * 100);
            return (
              <li key={m.slug}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink">{m.nombre}</span>
                  <span className="text-muted">
                    {d ? `${pct}% · ${Math.min(vistas, 100)}% visto` : "sin datos"}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
