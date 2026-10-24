import { create } from "zustand";
import type { Intento, Pregunta, ProgresoUnidad, Tarjeta } from "../types";
import { PREGUNTAS } from "../data/preguntas";
import { UNIDADES, unidadPorId } from "../data/unidades";
import { db, inicioDelDia } from "./db";
import { calidadPorRespuesta, estaVencida, nuevaTarjeta, sm2 } from "./sm2";

type Tema = "oscuro" | "claro";

const UMBRAL_DOMINIO = 0.8;

interface Estado {
  listo: boolean;
  tarjetas: Record<string, Tarjeta>;
  intentos: Intento[];
  unidades: Record<string, ProgresoUnidad>;
  tema: Tema;
  init: () => Promise<void>;
  responder: (pregunta: Pregunta, correcta: boolean, ms: number) => Promise<void>;
  marcarLeida: (unidadId: string) => Promise<void>;
  registrarQuiz: (unidadId: string, aciertos: number, total: number) => Promise<void>;
  reiniciar: () => Promise<void>;
  setTema: (tema: Tema) => void;
}

const temaGuardado = (localStorage.getItem("fsckdy:tema") as Tema) || "oscuro";

export const useApp = create<Estado>((set, get) => ({
  listo: false,
  tarjetas: {},
  intentos: [],
  unidades: {},
  tema: temaGuardado,

  init: async () => {
    const [tarjetas, intentos, unidades] = await Promise.all([
      db.tarjetas.toArray(),
      db.intentos.orderBy("ts").toArray(),
      db.unidades.toArray(),
    ]);
    set({
      tarjetas: Object.fromEntries(tarjetas.map((t) => [t.preguntaId, t])),
      intentos,
      unidades: Object.fromEntries(unidades.map((u) => [u.id, u])),
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

    const id = await db.transaction("rw", db.tarjetas, db.intentos, async () => {
      await db.tarjetas.put(siguiente);
      return db.intentos.add(intento);
    });

    set((s) => ({
      tarjetas: { ...s.tarjetas, [pregunta.id]: siguiente },
      intentos: [...s.intentos, { ...intento, id }],
    }));
  },

  marcarLeida: async (unidadId) => {
    const previo = get().unidades[unidadId];
    if (previo?.leida) return;
    const actualizado: ProgresoUnidad = {
      id: unidadId,
      leida: true,
      mejor: previo?.mejor ?? 0,
      dominada: previo?.dominada ?? false,
      ts: Date.now(),
    };
    await db.unidades.put(actualizado);
    set((s) => ({ unidades: { ...s.unidades, [unidadId]: actualizado } }));
  },

  registrarQuiz: async (unidadId, aciertos, total) => {
    const previo = get().unidades[unidadId];
    const puntaje = total ? aciertos / total : 0;
    const actualizado: ProgresoUnidad = {
      id: unidadId,
      leida: previo?.leida ?? true,
      mejor: Math.max(previo?.mejor ?? 0, puntaje),
      dominada: Math.max(previo?.mejor ?? 0, puntaje) >= UMBRAL_DOMINIO,
      ts: Date.now(),
    };
    await db.unidades.put(actualizado);
    set((s) => ({ unidades: { ...s.unidades, [unidadId]: actualizado } }));
  },

  reiniciar: async () => {
    await db.transaction("rw", db.tarjetas, db.intentos, db.unidades, async () => {
      await db.tarjetas.clear();
      await db.intentos.clear();
      await db.unidades.clear();
    });
    set({ tarjetas: {}, intentos: [], unidades: {} });
  },

  setTema: (tema) => {
    localStorage.setItem("fsckdy:tema", tema);
    set({ tema });
  },
}));

export function preguntasDeUnidad(unidadId: string): Pregunta[] {
  const unidad = unidadPorId(unidadId);
  if (!unidad) return [];
  return unidad.preguntas
    .map((id) => PREGUNTAS.find((q) => q.id === id))
    .filter((q): q is Pregunta => Boolean(q));
}

export function estadoUnidad(id: string, progreso: Record<string, ProgresoUnidad>) {
  const p = progreso[id];
  if (!p?.leida) return "nueva" as const;
  if (p.dominada) return "dominada" as const;
  if (p.mejor > 0) return "en-curso" as const;
  return "leida" as const;
}

export function pendientes(tarjetas: Record<string, Tarjeta>): Pregunta[] {
  const ahora = Date.now();
  return PREGUNTAS.filter((q) => {
    const t = tarjetas[q.id];
    return t ? estaVencida(t, ahora) : true;
  });
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

export function resumenRuta(progreso: Record<string, ProgresoUnidad>) {
  const dominadas = UNIDADES.filter((u) => progreso[u.id]?.dominada).length;
  const leidas = UNIDADES.filter((u) => progreso[u.id]?.leida).length;
  return { total: UNIDADES.length, dominadas, leidas };
}
