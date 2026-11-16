import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type MeshStandardMaterial } from "three";
import { Box, Cyl, useNight, useNightColor } from "./primitives";

const WOOD = "#C98B55";
const WOOD_DARK = "#8A5A35";

function Shell() {
  const wall = useNightColor("#F3E3D3", "#3A3550");
  const wall2 = useNightColor("#EBD6C4", "#332F48");
  const floor = useNightColor("#E2B887", "#6B4A35");
  const planks = Array.from({ length: 9 }, (_, i) => -4 + i);
  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[10.2, 0.2, 10.2]} />
        <meshStandardMaterial ref={floor} color="#E2B887" roughness={0.9} flatShading />
      </mesh>
      {planks.map((x) => (
        <Box key={x} size={[0.02, 0.005, 10]} position={[x, 0.002, 0]} color="#B98A5E" />
      ))}
      {/* back wall */}
      <mesh position={[0, 2, -5.1]} receiveShadow>
        <boxGeometry args={[10.4, 4.2, 0.2]} />
        <meshStandardMaterial ref={wall} color="#F3E3D3" roughness={0.95} flatShading />
      </mesh>
      {/* left wall */}
      <mesh position={[-5.1, 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.2, 10.4]} />
        <meshStandardMaterial ref={wall2} color="#EBD6C4" roughness={0.95} flatShading />
      </mesh>
      {/* baseboards */}
      <Box size={[10, 0.15, 0.05]} position={[0, 0.075, -4.98]} color="#FFFFFF" />
      <Box size={[0.05, 0.15, 10]} position={[-4.98, 0.075, 0]} color="#FFFFFF" />
      {/* rug */}
      <Cyl args={[1.7, 1.7, 0.03, 24]} position={[0.6, 0.015, 1.3]} color="#E07A5F" />
      <Cyl args={[1.3, 1.3, 0.035, 24]} position={[0.6, 0.016, 1.3]} color="#F2CC8F" />
      <Cyl args={[0.8, 0.8, 0.04, 24]} position={[0.6, 0.017, 1.3]} color="#81B29A" />
    </group>
  );
}

function Bed() {
  return (
    <group position={[-3.6, 0, -3.5]}>
      <Box size={[2.1, 0.35, 3.1]} position={[0, 0.2, 0]} color={WOOD_DARK} />
      <Box size={[2.1, 1.1, 0.15]} position={[0, 0.55, -1.5]} color={WOOD_DARK} />
      <Box size={[2.1, 0.55, 0.12]} position={[0, 0.3, 1.52]} color={WOOD_DARK} />
      {/* mattress */}
      <Box size={[1.95, 0.25, 2.9]} position={[0, 0.48, 0]} color="#FDF6EC" />
      {/* blanket */}
      <Box size={[2.0, 0.08, 1.9]} position={[0, 0.62, 0.45]} color="#60A5FA" />
      <Box size={[2.02, 0.09, 0.25]} position={[0, 0.63, -0.45]} color="#93C5FD" />
      {/* pillows */}
      <Box size={[0.8, 0.18, 0.5]} position={[-0.45, 0.68, -1.1]} rotation={[0.1, 0.05, 0]} color="#FFFFFF" />
      <Box size={[0.8, 0.18, 0.5]} position={[0.45, 0.68, -1.1]} rotation={[0.1, -0.08, 0]} color="#FCE7F3" />
      {/* nightstand */}
      <group position={[1.55, 0, -1.2]}>
        <Box size={[0.6, 0.65, 0.55]} position={[0, 0.325, 0]} color={WOOD} />
        <Box size={[0.5, 0.04, 0.02]} position={[0, 0.45, 0.28]} color={WOOD_DARK} />
        <Cyl args={[0.08, 0.12, 0.3]} position={[0, 0.8, 0]} color="#81B29A" />
        <Cyl args={[0.22, 0.15, 0.22, 8]} position={[0, 1.05, 0]} color="#FEF3C7" emissive="#FDE68A" emissiveIntensity={0.4} />
      </group>
    </group>
  );
}

export function Monitor() {
  const night = useNight();
  const screen = useRef<MeshStandardMaterial>(null);
  useFrame((s) => {
    if (screen.current) screen.current.emissiveIntensity = 0.6 + night.current.value * 1.2 + Math.sin(s.clock.elapsedTime * 2) * 0.05;
  });
  const lines = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ y: 0.22 - i * 0.08, w: 0.3 + ((i * 37) % 5) * 0.1, c: i % 2 ? "#F472B6" : "#A7F3D0" })),
    [],
  );
  return (
    <group>
      <Box size={[0.4, 0.03, 0.25]} position={[0, 0.015, 0]} color="#334155" />
      <Box size={[0.08, 0.35, 0.06]} position={[0, 0.2, 0]} color="#334155" />
      <Box size={[1.2, 0.72, 0.06]} position={[0, 0.66, 0.02]} color="#1E293B" />
      <mesh position={[0, 0.66, 0.056]}>
        <planeGeometry args={[1.1, 0.62]} />
        <meshStandardMaterial ref={screen} color="#0B2537" emissive="#38BDF8" emissiveIntensity={0.8} />
      </mesh>
      {lines.map((l, i) => (
        <mesh key={i} position={[-0.45 + l.w / 2, 0.66 + l.y, 0.058]}>
          <planeGeometry args={[l.w, 0.025]} />
          <meshBasicMaterial color={l.c} toneMapped={false} />
        </mesh>
      ))}
      {/* keyboard + mouse */}
      <Box size={[0.8, 0.03, 0.25]} position={[0, 0.015, 0.55]} color="#E2E8F0" />
      <Box size={[0.1, 0.03, 0.15]} position={[0.6, 0.015, 0.6]} color="#E2E8F0" />
    </group>
  );
}

export function Notes() {
  return (
    <group>
      {/* loose notes */}
      <Box size={[0.42, 0.01, 0.55]} position={[0, 0.005, 0]} rotation={[0, 0.2, 0]} color="#FFFFFF" />
      <Box size={[0.42, 0.01, 0.55]} position={[0.05, 0.015, 0.03]} rotation={[0, -0.15, 0]} color="#FEF9C3" />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} size={[0.3, 0.002, 0.015]} position={[0.05, 0.022, -0.15 + i * 0.09]} rotation={[0, -0.15, 0]} color="#64748B" />
      ))}
      {/* open notebook */}
      <group position={[-0.05, 0, 0.55]} rotation={[0, 0.3, 0]}>
        <Box size={[0.3, 0.025, 0.4]} position={[-0.155, 0.0125, 0]} color="#FDFDFD" />
        <Box size={[0.3, 0.025, 0.4]} position={[0.155, 0.0125, 0]} color="#FDFDFD" />
        <Box size={[0.64, 0.01, 0.42]} position={[0, 0.003, 0]} color="#EF4444" />
        <Box size={[0.012, 0.012, 0.32]} position={[0.3, 0.03, 0]} rotation={[0, 0.4, 0]} color="#F59E0B" />
      </group>
      {/* sticky note on wall */}
      <Box size={[0.2, 0.2, 0.01]} position={[-0.2, 0.9, -0.74]} rotation={[0, 0, 0.1]} color="#FDE047" />
      <Box size={[0.2, 0.2, 0.01]} position={[0.1, 1.1, -0.74]} rotation={[0, 0, -0.08]} color="#F9A8D4" />
    </group>
  );
}

function Desk() {
  const legs: [number, number][] = [[-1.3, -0.5], [1.3, -0.5], [-1.3, 0.5], [1.3, 0.5]];
  return (
    <group>
      <group position={[2.5, 0, -4.35]}>
        <Box size={[2.8, 0.08, 1.2]} position={[0, 1.01, 0]} color={WOOD} />
        {legs.map(([x, z]) => (
          <Box key={`${x}${z}`} size={[0.08, 0.97, 0.08]} position={[x, 0.485, z]} color={WOOD_DARK} />
        ))}
        {/* drawers */}
        <Box size={[0.6, 0.5, 1.0]} position={[1.0, 0.72, 0]} color={WOOD} />
        <Box size={[0.3, 0.03, 0.02]} position={[1.0, 0.72, 0.51]} color={WOOD_DARK} />
      </group>
      {/* desk lamp */}
      <group position={[3.6, 1.05, -4.65]}>
        <Cyl args={[0.12, 0.14, 0.04]} position={[0, 0.02, 0]} color="#0F172A" />
        <Box size={[0.03, 0.55, 0.03]} position={[0, 0.3, 0.06]} rotation={[0.25, 0, 0]} color="#0F172A" />
        <Cyl args={[0.06, 0.16, 0.18]} position={[0, 0.58, 0.18]} rotation={[0.5, 0, 0]} color="#38BDF8" emissive="#7DD3FC" emissiveIntensity={0.6} />
      </group>
      {/* mug */}
      <Cyl args={[0.06, 0.06, 0.13]} position={[3.05, 1.115, -3.95]} color="#FB7185" />
    </group>
  );
}

export function Chair() {
  return (
    <group>
      <Cyl args={[0.05, 0.05, 0.45]} position={[0, 0.27, 0]} color="#334155" />
      <Cyl args={[0.35, 0.35, 0.05, 5]} position={[0, 0.04, 0]} color="#334155" />
      <Box size={[0.65, 0.1, 0.62]} position={[0, 0.55, 0]} color="#EF4444" />
      <Box size={[0.65, 0.75, 0.1]} position={[0, 1.0, 0.33]} rotation={[-0.08, 0, 0]} color="#EF4444" />
      <Box size={[0.08, 0.08, 0.5]} position={[-0.34, 0.75, 0.0]} color="#334155" />
      <Box size={[0.08, 0.08, 0.5]} position={[0.34, 0.75, 0.0]} color="#334155" />
    </group>
  );
}

const BOOK_COLORS = ["#E07A5F", "#3D405B", "#81B29A", "#F2CC8F", "#A78BFA", "#F472B6", "#38BDF8"];

function Shelf() {
  const levels = [0.05, 0.62, 1.19, 1.76, 2.33];
  return (
    <group position={[-4.78, 0, 1.6]}>
      <Box size={[0.42, 2.4, 0.06]} position={[0, 1.2, -0.72]} color={WOOD_DARK} />
      <Box size={[0.42, 2.4, 0.06]} position={[0, 1.2, 0.72]} color={WOOD_DARK} />
      {levels.map((y) => (
        <Box key={y} size={[0.42, 0.05, 1.44]} position={[0, y, 0]} color={WOOD} />
      ))}
      {/* decorative books (the dictionary is an interactive item) */}
      {[0.62, 1.76].map((y, row) =>
        BOOK_COLORS.slice(row, row + 5).map((c, i) => {
          const h = 0.32 + ((i * 7 + row) % 3) * 0.06;
          return <Box key={`${y}-${i}`} size={[0.3, h, 0.09]} position={[0, y + 0.025 + h / 2, -0.55 + i * 0.11]} color={c} />;
        }),
      )}
      {[0, 1, 2].map((i) => (
        <Box key={i} size={[0.3, 0.1, 0.4]} position={[0, 0.1 + i * 0.1, 0.35]} rotation={[0, i * 0.15, 0]} color={BOOK_COLORS[i + 3]} />
      ))}
      <Cyl args={[0.1, 0.08, 0.2]} position={[0, 2.46, -0.3]} color="#E07A5F" />
      <mesh position={[0, 2.66, -0.3]} castShadow>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#4ADE80" flatShading />
      </mesh>
    </group>
  );
}

function Window() {
  const night = useNight();
  const glass = useRef<MeshStandardMaterial>(null);
  const orb = useRef<MeshStandardMaterial>(null);
  const [day, nightC, sun, moon] = useMemo(
    () => [new Color("#9BD8FF"), new Color("#1B2550"), new Color("#FDE68A"), new Color("#E0E7FF")],
    [],
  );
  useFrame(() => {
    const n = night.current.value;
    glass.current?.color.copy(day).lerp(nightC, n);
    glass.current?.emissive.copy(day).lerp(nightC, n);
    orb.current?.emissive.copy(sun).lerp(moon, n);
  });
  return (
    <group position={[-4.97, 2.1, -0.6]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 1.2]} />
        <meshStandardMaterial ref={glass} color="#9BD8FF" emissive="#9BD8FF" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.01, 0.25, 0.3]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.14, 12]} />
        <meshStandardMaterial ref={orb} color="#FFFFFF" emissive="#FDE68A" emissiveIntensity={1.2} />
      </mesh>
      <Box size={[0.1, 1.35, 0.08]} position={[0.03, 0, -0.68]} color="#FFFFFF" />
      <Box size={[0.1, 1.35, 0.08]} position={[0.03, 0, 0.68]} color="#FFFFFF" />
      <Box size={[0.1, 0.08, 1.44]} position={[0.03, 0.64, 0]} color="#FFFFFF" />
      <Box size={[0.25, 0.08, 1.5]} position={[0.08, -0.64, 0]} color="#FFFFFF" />
      <Box size={[0.06, 1.2, 0.05]} position={[0.03, 0, 0]} color="#FFFFFF" />
      <Box size={[0.06, 0.05, 1.3]} position={[0.03, 0, 0]} color="#FFFFFF" />
      {/* curtains */}
      <Box size={[0.08, 1.6, 0.3]} position={[0.1, -0.05, -0.9]} color="#F9A8D4" />
      <Box size={[0.08, 1.6, 0.3]} position={[0.1, -0.05, 0.9]} color="#F9A8D4" />
    </group>
  );
}

function Plant() {
  return (
    <group position={[-1.9, 0, -4.5]}>
      <Cyl args={[0.25, 0.2, 0.45, 8]} position={[0, 0.225, 0]} color="#E07A5F" />
      {[[0, 0.75, 0, 0.32], [0.15, 1.0, 0.05, 0.24], [-0.12, 1.05, -0.05, 0.22]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={i ? "#22C55E" : "#16A34A"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export default function Furniture() {
  return (
    <group>
      <Shell />
      <Bed />
      <Desk />
      <Shelf />
      <Window />
      <Plant />
    </group>
  );
}
