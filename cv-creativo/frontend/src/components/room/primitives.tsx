import { createContext, useContext, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type MeshStandardMaterial } from "three";
import type { V3 } from "@/lib/room";

export interface NightState {
  value: number; // animated 0 (día) → 1 (noche)
  target: number;
}

export const NightContext = createContext<RefObject<NightState> | null>(null);

export function useNight(): RefObject<NightState> {
  const ctx = useContext(NightContext);
  if (!ctx) throw new Error("useNight outside NightContext");
  return ctx;
}

/** Material ref whose color blends between a day and a night tint. */
export function useNightColor(day: string, night: string) {
  const ref = useRef<MeshStandardMaterial>(null);
  const n = useNight();
  const [d, nn] = useMemo(() => [new Color(day), new Color(night)], [day, night]);
  useFrame(() => {
    ref.current?.color.copy(d).lerp(nn, n.current.value);
  });
  return ref;
}

interface MeshProps {
  position?: V3;
  rotation?: V3;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
}

export function Box({ size, position, rotation, color, emissive, emissiveIntensity = 0, metalness = 0, roughness = 0.8 }: MeshProps & { size: V3 }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
        flatShading
      />
    </mesh>
  );
}

export function Cyl({
  args,
  position,
  rotation,
  color,
  emissive,
  emissiveIntensity = 0,
  metalness = 0,
  roughness = 0.8,
}: MeshProps & { args: [number, number, number, number?] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 10]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
        flatShading
      />
    </mesh>
  );
}
