import Dexie, { type Table } from "dexie";
import type { Intento, ProgresoUnidad, Tarjeta } from "../types";
import { DIA } from "./sm2";

class FsckDyDB extends Dexie {
  tarjetas!: Table<Tarjeta, string>;
  intentos!: Table<Intento, number>;
  unidades!: Table<ProgresoUnidad, string>;

  constructor() {
    super("fsckdy");
    this.version(2).stores({
      tarjetas: "preguntaId, due",
      intentos: "++id, preguntaId, materia, ts",
      unidades: "id, dominada",
    });
  }
}

export const db = new FsckDyDB();

export async function cargarTarjetas(): Promise<Tarjeta[]> {
  return db.tarjetas.toArray();
}

export async function cargarIntentos(desde = 0): Promise<Intento[]> {
  return db.intentos.where("ts").aboveOrEqual(desde).toArray();
}

export function inicioDelDia(ts = Date.now()): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function claveDia(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function calcularRacha(intentos: Intento[]): number {
  const dias = new Set(intentos.map((i) => claveDia(i.ts)));
  let racha = 0;
  let cursor = inicioDelDia();

  if (!dias.has(claveDia(cursor))) {
    cursor -= DIA;
    if (!dias.has(claveDia(cursor))) return 0;
  }

  while (dias.has(claveDia(cursor))) {
    racha += 1;
    cursor -= DIA;
  }
  return racha;
}
