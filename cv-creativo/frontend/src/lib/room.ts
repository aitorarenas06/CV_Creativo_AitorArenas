import type { LucideIcon } from "lucide-react";
import { Armchair, BookA, Briefcase, Car, Clapperboard, Monitor, Music, NotebookPen, Volleyball, Wallet } from "lucide-react";

export interface Entry {
  title: string;
  description: string;
}

export interface RoomObject {
  key: string;
  name: string;
  category: string;
  entries: Entry[];
  image: string | null; // data URL
}

export const ITEMS: { key: string; name: string; icon: LucideIcon }[] = [
  { key: "cartera", name: "Cartera", icon: Wallet },
  { key: "claqueta", name: "Claqueta de cine", icon: Clapperboard },
  { key: "flauta", name: "Flauta travesera", icon: Music },
  { key: "balon", name: "Balón", icon: Volleyball },
  { key: "maletin", name: "Maletín", icon: Briefcase },
  { key: "diccionario", name: "Diccionario de inglés", icon: BookA },
  { key: "coche", name: "Coche de juguete", icon: Car },
  { key: "ordenador", name: "Ordenador", icon: Monitor },
  { key: "apuntes", name: "Apuntes", icon: NotebookPen },
  { key: "silla", name: "Silla", icon: Armchair },
];

export function objectInfo(key: string, objects: RoomObject[] | undefined): RoomObject {
  const found = objects?.find((o) => o.key === key);
  if (found) return found;
  const name = ITEMS.find((i) => i.key === key)?.name ?? key;
  return { key, name, category: "", entries: [{ title: name, description: "Información próximamente." }], image: null };
}

export type V3 = [number, number, number];

export interface Waypoint {
  id: string;
  label: string;
  approach: [number, number]; // floor point (x, z) reached walking
  pos: V3; // final resting position of the feet
  rotY: number;
  sit: number;
  lie: number;
}

export const WAYPOINTS: Waypoint[] = [
  { id: "chair", label: "Trabajando en el escritorio", approach: [2.5, -2.1], pos: [2.5, 0, -3.1], rotY: Math.PI, sit: 1, lie: 0 },
  { id: "bed", label: "Descansando en la cama", approach: [-2.1, -2.3], pos: [-3.6, 0.75, -2.35], rotY: 0, sit: 0, lie: 1 },
  { id: "window", label: "Mirando por la ventana", approach: [-3.9, -0.6], pos: [-3.9, 0, -0.6], rotY: -Math.PI / 2, sit: 0, lie: 0 },
  { id: "shelf", label: "Repasando inglés en la estantería", approach: [-3.8, 1.6], pos: [-3.8, 0, 1.6], rotY: -Math.PI / 2, sit: 0, lie: 0 },
  { id: "ball", label: "Jugando con el balón", approach: [0.9, 1.3], pos: [0.9, 0, 1.3], rotY: 0.9, sit: 0, lie: 0 },
];

export const STATION_SECONDS = 180; // 3 minutos en cada posición

export const DAY_CYCLE_MS = 10 * 60 * 1000; // modo Auto: un día completo cada 10 minutos

/** Hora virtual (0-24) del ciclo rápido, anclada al reloj real para que todos vean lo mismo. */
export function virtualHour(nowMs: number): number {
  return ((nowMs % DAY_CYCLE_MS) / DAY_CYCLE_MS) * 24;
}

/** 0 = día, 1 = noche, con transiciones suaves al amanecer (6-7h) y atardecer (19-20h). */
export function nightFromHour(h: number): number {
  if (h >= 7 && h < 19) return 0;
  if (h >= 20 || h < 6) return 1;
  return h < 7 ? 7 - h : h - 19;
}
