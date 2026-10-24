import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Pregunta } from "../../types";
import { pendientes, useApp } from "../../lib/store";

const TAMANO_SESION = 10;

function mezclar<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Sesion() {
  const tarjetas = useApp((s) => s.tarjetas);
  const responder = useApp((s) => s.responder);
  const navigate = useNavigate();

  const [cola] = useState<Pregunta[]>(() => {
    const lista = mezclar(pendientes(tarjetas));
    return lista.slice(0, TAMANO_SESION);
  });

  const [indice, setIndice] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [respondidas, setRespondidas] = useState(0);
  const inicio = useRef(Date.now());

  const pregunta = cola[indice];
  const terminado = indice >= cola.length;

  useEffect(() => {
    inicio.current = Date.now();
  }, [indice]);

  const progreso = useMemo(
    () => Math.round((Math.min(indice, cola.length) / Math.max(cola.length, 1)) * 100),
    [indice, cola.length],
  );

  if (cola.length === 0) {
    return (
      <div className="card mt-10 space-y-3 p-6 text-center">
        <p className="text-3xl">✓</p>
        <h2 className="text-lg font-semibold">Nada pendiente</h2>
        <p className="text-sm text-muted">Ya repasaste todo lo que tocaba hoy. Vuelve mañana.</p>
        <Link to="/" className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          Volver
        </Link>
      </div>
    );
  }

  if (terminado) {
    const precision = respondidas ? Math.round((aciertos / respondidas) * 100) : 0;
    return (
      <div className="mt-6 space-y-4">
        <div className="card space-y-2 p-6 text-center">
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Sesión completada</p>
          <p className="text-5xl font-bold text-accent">{precision}%</p>
          <p className="text-sm text-muted">
            {aciertos} de {respondidas} correctas
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full rounded-xl bg-accent py-3 font-semibold text-accent-ink"
        >
          Terminar
        </button>
        <button
          onClick={() => navigate("/progreso")}
          className="w-full rounded-xl border border-line py-3 text-sm font-medium text-muted"
        >
          Ver progreso
        </button>
      </div>
    );
  }

  const contestar = async (i: number) => {
    if (elegida !== null) return;
    const correcta = i === pregunta.respuesta;
    setElegida(i);
    setRespondidas((n) => n + 1);
    if (correcta) setAciertos((n) => n + 1);
    await responder(pregunta, correcta, Date.now() - inicio.current);
  };

  const siguiente = () => {
    setElegida(null);
    setIndice((n) => n + 1);
  };

  const correcta = elegida !== null && elegida === pregunta.respuesta;

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progreso}%` }} />
        </div>
        <span className="text-xs text-muted">
          {indice + 1}/{cola.length}
        </span>
      </div>

      <div className="card p-5">
        <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
          {pregunta.materiaNombre} · {pregunta.tema}
        </p>
        <h2 className="mt-2 text-base leading-snug font-semibold">{pregunta.enunciado}</h2>

        <ul className="mt-4 space-y-2">
          {pregunta.opciones.map((op, i) => {
            const esCorrecta = i === pregunta.respuesta;
            const marcada = elegida === i;
            let clase = "border-line bg-surface-2 text-ink";
            if (elegida !== null && esCorrecta) clase = "border-ok bg-ok/10 text-ink";
            else if (marcada) clase = "border-bad bg-bad/10 text-ink";
            return (
              <li key={i}>
                <button
                  onClick={() => contestar(i)}
                  disabled={elegida !== null}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${clase}`}
                >
                  <span className="mr-2 font-semibold text-muted">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {op}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {elegida !== null && (
        <div className="card space-y-2 p-4">
          <p className="text-sm font-semibold" style={{ color: correcta ? "var(--ok)" : "var(--bad)" }}>
            {correcta ? "Correcto" : "Incorrecto"}
          </p>
          <p className="text-sm leading-relaxed text-muted">{pregunta.explicacion}</p>
          <button
            onClick={siguiente}
            className="mt-1 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-ink"
          >
            {indice + 1 === cola.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      )}
    </div>
  );
}
