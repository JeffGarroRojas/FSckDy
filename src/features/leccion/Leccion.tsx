import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Bloque } from "../../types";
import { unidadPorId } from "../../data/unidades";
import { estadoUnidad, preguntasDeUnidad, useApp } from "../../lib/store";

function BloqueVista({ b }: { b: Bloque }) {
  switch (b.t) {
    case "p":
      return <p className="text-sm leading-relaxed text-ink/90">{b.texto}</p>;
    case "lista":
      return (
        <div>
          {b.titulo && <p className="mb-1.5 text-sm font-semibold text-ink">{b.titulo}</p>}
          <ul className="space-y-1.5">
            {b.items.map((i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="text-accent" aria-hidden>•</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "ejemplo":
      return (
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          {b.titulo && <p className="mb-1 text-[11px] font-semibold tracking-wider text-accent uppercase">{b.titulo}</p>}
          <p className="font-mono text-xs leading-relaxed text-ink/90">{b.texto}</p>
        </div>
      );
    case "clave":
      return (
        <div className="rounded-xl p-4" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
          <p className="mb-1 text-[11px] font-bold tracking-wider text-accent uppercase">Clave del examen</p>
          <p className="text-sm leading-relaxed text-ink">{b.texto}</p>
        </div>
      );
  }
}

export default function Leccion() {
  const { id = "" } = useParams();
  const unidad = unidadPorId(id);
  const progreso = useApp((s) => s.unidades);
  const marcarLeida = useApp((s) => s.marcarLeida);
  const preguntas = preguntasDeUnidad(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!unidad) {
    return (
      <div className="card mt-8 p-6 text-center text-sm text-muted">
        Unidad no encontrada. <Link to="/" className="text-accent">Volver a la ruta</Link>
      </div>
    );
  }

  const estado = estadoUnidad(id, progreso);
  const mejor = progreso[id]?.mejor ?? 0;

  return (
    <div className="space-y-4">
      <Link to="/" className="text-xs text-muted">← Ruta</Link>

      <header>
        <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">{unidad.materiaNombre}</p>
        <h1 className="mt-1 text-xl font-bold leading-tight">{unidad.titulo}</h1>
        <p className="mt-1 text-xs text-muted">
          {estado === "dominada" ? `Dominada · mejor ${Math.round(mejor * 100)}%` : `Preguntas: ${preguntas.length}`}
        </p>
      </header>

      <article className="card space-y-4 p-5">
        {unidad.leccion.map((b, i) => (
          <BloqueVista key={i} b={b} />
        ))}
      </article>

      <div className="space-y-2">
        <button
          onClick={() => void marcarLeida(id)}
          className="w-full rounded-xl border border-line py-3 text-sm text-muted"
        >
          {progreso[id]?.leida ? "Lección leída ✓" : "Marcar como leída"}
        </button>
        <Link
          to={`/unidad/${id}/quiz`}
          className="block w-full rounded-xl bg-accent py-3 text-center font-semibold text-accent-ink"
        >
          Hacer el quiz ({preguntas.length} preguntas)
        </Link>
      </div>
    </div>
  );
}
