import type { Tarjeta } from "../types";

export const DIA = 86_400_000;

export function nuevaTarjeta(preguntaId: string): Tarjeta {
  return { preguntaId, ease: 2.5, interval: 0, reps: 0, due: 0, lapses: 0 };
}

export function sm2(t: Tarjeta, calidad: number, ahora = Date.now()): Tarjeta {
  let { ease, interval, reps, lapses } = t;

  if (calidad >= 3) {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease);
  } else {
    reps = 0;
    interval = 1;
    lapses += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - calidad) * (0.08 + (5 - calidad) * 0.02)));

  return {
    preguntaId: t.preguntaId,
    ease: Math.round(ease * 100) / 100,
    interval,
    reps,
    lapses,
    due: ahora + interval * DIA,
  };
}

export function calidadPorRespuesta(correcta: boolean, ms: number): number {
  if (!correcta) return 2;
  if (ms < 8000) return 5;
  if (ms < 20000) return 4;
  return 3;
}

export function estaVencida(t: Tarjeta, ahora = Date.now()): boolean {
  return t.due <= ahora;
}
