export type Dificultad = 1 | 2 | 3;

export interface Pregunta {
  id: string;
  materia: string;
  materiaNombre: string;
  tema: string;
  enunciado: string;
  opciones: string[];
  respuesta: number;
  explicacion: string;
  dificultad: Dificultad;
}

export interface Tarjeta {
  preguntaId: string;
  ease: number;
  interval: number;
  reps: number;
  due: number;
  lapses: number;
}

export interface Intento {
  id?: number;
  preguntaId: string;
  materia: string;
  correcta: boolean;
  calidad: number;
  ms: number;
  ts: number;
}
