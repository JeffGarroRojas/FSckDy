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

export type Bloque =
  | { t: "p"; texto: string }
  | { t: "lista"; titulo?: string; items: string[] }
  | { t: "clave"; texto: string }
  | { t: "ejemplo"; titulo?: string; texto: string };

export interface Unidad {
  id: string;
  programa?: "dam" | "fullstack";
  materia: string;
  materiaNombre: string;
  titulo: string;
  orden: number;
  leccion: Bloque[];
  preguntas: string[];
}

export interface ProgresoUnidad {
  id: string;
  leida: boolean;
  mejor: number;
  dominada: boolean;
  ts: number;
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
