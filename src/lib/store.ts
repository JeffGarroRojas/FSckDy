import { create } from "zustand";
import type { Intento, Pregunta, Tarjeta } from "../types";
import { PREGUNTAS } from "../data/preguntas";
import { db, inicioDelDia } from "./db";
import { calidadPorRespuesta, estaVencida, nuevaTarjeta, sm2 } from "./sm2";

type Tema = "oscuro" | "claro";

interface Estado {
  listo: boolean;
  tarjetas: Record<string, Tarjeta>;
  intentos: Intento[];
  tema: Tema;
  init: () => Promise<void>;
  responder: (pregunta: Pregunta, correcta: boolean, ms: number) => Promise<void>;
  reiniciar: () => Promise<void>;
  setTema: (tema: Tema) => void;
}

const temaGuardado = (localStorage.getItem("fsckdy:tema") as Tema) || "oscuro";

export const useApp = create<Estado>((set, get) => ({
  listo: false,
  tarjetas: {},
  intentos: [],
  tema: temaGuardado,

  init: async () => {
    const [tarjetas, intentos] = await Promise.all([
      db.tarjetas.toArray(),
      db.intentos.orderBy("ts").toArray(),
    ]);
    set({
      tarjetas: Object.fromEntries(tarjetas.map((t) => [t.preguntaId, t])),
      intentos,
      listo: true,
    });
  },

  responder: async (pregunta, correcta, ms) => {
    const calidad = calidadPorRespuesta(correcta, ms);
    const actual = get().tarjetas[pregunta.id] ?? nuevaTarjeta(pregunta.id);
    const siguiente = sm2(actual, calidad);

    const intento: Intento = {
      preguntaId: pregunta.id,
      materia: pregunta.materia,
      correcta,
      calidad,
      ms,
      ts: Date.now(),
    };

    await db.transaction("rw", db.tarjetas, db.intentos, async () => {
      await db.tarjetas.put(siguiente);
      await db.intentos.add(intento);
    });

    const id = await db.intentos.orderBy("ts").last();
    set((s) => ({
      tarjetas: { ...s.tarjetas, [pregunta.id]: siguiente },
      intentos: [...s.intentos, id ?? intento],
    }));
  },

  reiniciar: async () => {
    await db.transaction("rw", db.tarjetas, db.intentos, async () => {
      await db.tarjetas.clear();
      await db.intentos.clear();
    });
    set({ tarjetas: {}, intentos: [] });
  },

  setTema: (tema) => {
    localStorage.setItem("fsckdy:tema", tema);
    set({ tema });
  },

}));

export function pendientes(tarjetas: Record<string, Tarjeta>): Pregunta[] {
  const ahora = Date.now();
  const vencidas = PREGUNTAS.filter((q) => {
    const t = tarjetas[q.id];
    return t ? estaVencida(t, ahora) : true;
  });
  return vencidas;
}

export function estadisticasHoy(intentos: Intento[]) {
  const desde = inicioDelDia();
  const hoy = intentos.filter((i) => i.ts >= desde);
  const aciertos = hoy.filter((i) => i.correcta).length;
  return {
    respondidas: hoy.length,
    aciertos,
    precision: hoy.length ? Math.round((aciertos / hoy.length) * 100) : 0,
  };
}

export function progresoPorMateria(intentos: Intento[]) {
  const mapa = new Map<string, { total: number; aciertos: number }>();
  for (const i of intentos) {
    const cur = mapa.get(i.materia) ?? { total: 0, aciertos: 0 };
    cur.total += 1;
    if (i.correcta) cur.aciertos += 1;
    mapa.set(i.materia, cur);
  }
  return mapa;
}
