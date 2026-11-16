import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Quaternion, Vector3, type Group, type MeshBasicMaterial } from "three";
import { Mouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITEMS, objectInfo, type RoomObject, type V3 } from "@/lib/room";
import { Box, Cyl } from "./primitives";
import { Chair, Monitor, Notes } from "./Furniture";

interface HoverableProps {
  k: string;
  position: V3;
  rotation?: V3;
  hitbox: V3;
  hitboxY?: number;
  tooltipY: number;
  lift?: boolean;
  hovered: string | null;
  setHovered: Dispatch<SetStateAction<string | null>>;
  info: RoomObject;
  children: ReactNode;
}

function Tooltip({ info }: { info: RoomObject }) {
  const Icon = ITEMS.find((i) => i.key === info.key)?.icon;
  const list = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState({ above: false, below: false });

  // While the card is open, the mouse wheel scrolls its content instead of zooming the camera.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const update = () =>
      setMore({ above: el.scrollTop > 2, below: el.scrollTop + el.clientHeight < el.scrollHeight - 2 });
    update();
    const onWheel = (e: WheelEvent) => {
      if (el.scrollHeight <= el.clientHeight) return; // nothing to scroll → keep normal zoom
      e.preventDefault();
      e.stopPropagation();
      el.scrollTop += e.deltaY;
      update();
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
  }, [info]);

  return (
    <div
      data-testid={`object-tooltip-${info.key}`}
      className="tooltip-pop pointer-events-none w-[280px] rounded-2xl border border-white/15 bg-slate-900/85 p-4 text-left text-white shadow-2xl backdrop-blur-xl"
    >
      {info.image && (
        <img
          data-testid="object-tooltip-image"
          src={info.image}
          alt={info.name}
          className="mb-3 h-36 w-full rounded-xl object-cover"
        />
      )}
      <div className="mb-2 flex items-center gap-2">
        {Icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-[#FF2A6D]/15 text-[#FF7AA2]">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{info.name}</p>
          {info.category && (
            <p data-testid="object-tooltip-category" className="truncate text-[11px] font-medium text-sky-300">
              {info.category}
            </p>
          )}
        </div>
      </div>
      <ul
        ref={list}
        data-testid="object-tooltip-scroll"
        className={cn(
          "tooltip-scroll space-y-2.5 overflow-y-auto pr-1",
          info.image ? "max-h-[15rem]" : "max-h-[20rem]",
          more.above && more.below ? "fade-both" : more.below ? "fade-bottom" : more.above ? "fade-top" : "",
        )}
      >
        {info.entries.map((e, i) => (
          <li key={i} data-testid={`object-tooltip-entry-${i}`}>
            <h3 data-testid="object-tooltip-title" className="font-heading text-base leading-tight font-semibold">
              {e.title}
            </h3>
            {e.description && (
              <p data-testid="object-tooltip-description" className="mt-0.5 text-[13px] leading-relaxed whitespace-pre-line text-slate-300">
                {e.description}
              </p>
            )}
          </li>
        ))}
      </ul>
      {(more.above || more.below) && (
        <p data-testid="object-tooltip-scroll-hint" className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-sky-300">
          <Mouse className="size-3.5" />
          {more.below ? "Usa la rueda del ratón para ver más" : "Has llegado al final"}
        </p>
      )}
    </div>
  );
}

function Hoverable({ k, position, rotation, hitbox, hitboxY, tooltipY, lift = true, hovered, setHovered, info, children }: HoverableProps) {
  const inner = useRef<Group>(null);
  const ring = useRef<MeshBasicMaterial>(null);
  const isHovered = hovered === k;
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    if (inner.current) {
      const targetY = isHovered && lift ? 0.12 + Math.sin(t * 4) * 0.03 : 0;
      inner.current.position.y += (targetY - inner.current.position.y) * Math.min(1, dt * 10);
    }
    if (ring.current) ring.current.opacity = 0.5 + Math.sin(t * 5) * 0.25;
  });
  const radius = Math.max(hitbox[0], hitbox[2]) / 2 + 0.12;
  return (
    <group position={position} rotation={rotation}>
      <group
        ref={inner}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(k);
        }}
        onPointerOut={() => setHovered((h) => (h === k ? null : h))}
      >
        {children}
        <mesh position={[0, hitboxY ?? hitbox[1] / 2, 0]}>
          <boxGeometry args={hitbox} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      {isHovered && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[radius, radius + 0.06, 32]} />
            <meshBasicMaterial ref={ring} color="#38BDF8" transparent toneMapped={false} />
          </mesh>
          <Html position={[0, tooltipY, 0]} center zIndexRange={[20, 10]} className="pointer-events-none">
            <Tooltip info={info} />
          </Html>
        </>
      )}
    </group>
  );
}

const Wallet = () => (
  <group>
    <Box size={[0.34, 0.05, 0.24]} position={[0, 0.025, 0]} color="#B45309" roughness={0.6} />
    <Box size={[0.34, 0.012, 0.1]} position={[0, 0.056, 0.06]} color="#92400E" />
    <Cyl args={[0.018, 0.018, 0.015]} position={[0.1, 0.065, 0.06]} color="#FBBF24" metalness={0.8} roughness={0.3} />
  </group>
);

const STRIPES = [-0.22, -0.08, 0.06, 0.2];
const Clapper = () => (
  <group rotation={[-0.15, 0, 0]}>
    <Box size={[0.62, 0.45, 0.05]} position={[0, 0.25, 0]} color="#18181B" />
    {[0.33, 0.22, 0.12].map((y) => (
      <Box key={y} size={[0.54, 0.012, 0.01]} position={[0, y, 0.03]} color="#F4F4F5" />
    ))}
    <Box size={[0.62, 0.08, 0.05]} position={[0, 0.51, 0]} color="#18181B" />
    {STRIPES.map((x) => (
      <Box key={x} size={[0.06, 0.08, 0.052]} position={[x, 0.51, 0]} rotation={[0, 0, 0.5]} color="#F4F4F5" />
    ))}
    <group position={[-0.31, 0.56, 0]} rotation={[0, 0, 0.35]}>
      <Box size={[0.62, 0.08, 0.05]} position={[0.31, 0, 0]} color="#18181B" />
      {STRIPES.map((x) => (
        <Box key={x} size={[0.06, 0.08, 0.052]} position={[x + 0.31, 0, 0]} rotation={[0, 0, -0.5]} color="#F4F4F5" />
      ))}
    </group>
  </group>
);

const Flute = () => (
  <group>
    <Cyl args={[0.025, 0.025, 0.12]} position={[-0.42, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]} color="#8A5A35" />
    <Cyl args={[0.025, 0.025, 0.12]} position={[0.42, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]} color="#8A5A35" />
    <Cyl args={[0.032, 0.032, 1.25, 12]} position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} color="#E2E8F0" metalness={0.85} roughness={0.25} />
    <Box size={[0.08, 0.02, 0.06]} position={[-0.45, 0.09, 0]} color="#CBD5E1" metalness={0.8} roughness={0.3} />
    {[-0.15, -0.05, 0.05, 0.15, 0.25, 0.35].map((x) => (
      <Cyl key={x} args={[0.022, 0.022, 0.02]} position={[x, 0.09, 0]} color="#F8FAFC" metalness={0.9} roughness={0.2} />
    ))}
  </group>
);

const PHI = (1 + Math.sqrt(5)) / 2;
const BALL_R = 0.28;
// The 12 icosahedron vertices = centres of a football's black pentagons.
const PENTAGONS = [
  [0, 1, PHI], [0, 1, -PHI], [0, -1, PHI], [0, -1, -PHI],
  [1, PHI, 0], [1, -PHI, 0], [-1, PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1],
].map(([x, y, z]) => {
  const dir = new Vector3(x, y, z).normalize();
  return { pos: dir.clone().multiplyScalar(BALL_R * 1.003), quat: new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), dir) };
});

const Ball = () => (
  <group position={[0, BALL_R, 0]} rotation={[0.3, 0.4, 0]}>
    <mesh castShadow>
      <sphereGeometry args={[BALL_R, 24, 16]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.55} />
    </mesh>
    {PENTAGONS.map((p, i) => (
      <mesh key={i} position={p.pos} quaternion={p.quat}>
        <circleGeometry args={[0.085, 5]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

const Briefcase = () => (
  <group>
    <Box size={[0.75, 0.5, 0.22]} position={[0, 0.25, 0]} color="#334155" roughness={0.5} />
    <Box size={[0.76, 0.03, 0.23]} position={[0, 0.38, 0]} color="#1E293B" />
    <Box size={[0.06, 0.05, 0.02]} position={[-0.22, 0.38, 0.12]} color="#FBBF24" metalness={0.8} roughness={0.3} />
    <Box size={[0.06, 0.05, 0.02]} position={[0.22, 0.38, 0.12]} color="#FBBF24" metalness={0.8} roughness={0.3} />
    <mesh position={[0, 0.55, 0]} castShadow>
      <torusGeometry args={[0.1, 0.022, 6, 12, Math.PI]} />
      <meshStandardMaterial color="#1E293B" flatShading />
    </mesh>
  </group>
);

const Dictionary = () => (
  <group>
    <Box size={[0.3, 0.44, 0.14]} position={[0, 0.22, 0]} color="#1D4ED8" roughness={0.6} />
    <Box size={[0.28, 0.42, 0.145]} position={[-0.02, 0.22, 0]} color="#F8FAFC" />
    <Box size={[0.01, 0.06, 0.1]} position={[0.155, 0.3, 0]} color="#FBBF24" metalness={0.6} />
    <Box size={[0.01, 0.02, 0.1]} position={[0.155, 0.12, 0]} color="#DC2626" />
  </group>
);

const ToyCar = () => (
  <group>
    <Box size={[0.7, 0.16, 0.36]} position={[0, 0.17, 0]} color="#EF4444" roughness={0.4} />
    <Box size={[0.36, 0.15, 0.32]} position={[-0.05, 0.32, 0]} color="#EF4444" roughness={0.4} />
    <Box size={[0.3, 0.1, 0.33]} position={[-0.05, 0.33, 0]} color="#BAE6FD" emissive="#7DD3FC" emissiveIntensity={0.2} />
    <Box size={[0.02, 0.05, 0.08]} position={[0.36, 0.18, 0.11]} color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.6} />
    <Box size={[0.02, 0.05, 0.08]} position={[0.36, 0.18, -0.11]} color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.6} />
    {[[-0.22, 0.19], [0.22, 0.19], [-0.22, -0.19], [0.22, -0.19]].map(([x, z]) => (
      <Cyl key={`${x}${z}`} args={[0.09, 0.09, 0.07, 10]} position={[x, 0.09, z]} rotation={[Math.PI / 2, 0, 0]} color="#111827" />
    ))}
  </group>
);

interface ItemsProps {
  hovered: string | null;
  setHovered: Dispatch<SetStateAction<string | null>>;
  objects: RoomObject[] | undefined;
}

export default function Items({ hovered, setHovered, objects }: ItemsProps) {
  const common = (k: string) => ({ k, hovered, setHovered, info: objectInfo(k, objects) });
  return (
    <group>
      <Hoverable {...common("cartera")} position={[3.3, 1.05, -3.95]} rotation={[0, -0.3, 0]} hitbox={[0.45, 0.2, 0.35]} tooltipY={0.9}>
        <Wallet />
      </Hoverable>
      <Hoverable {...common("claqueta")} position={[3.6, 0, 1.3]} rotation={[0, 0.6, 0]} hitbox={[0.9, 1.0, 0.4]} tooltipY={1.6}>
        <group scale={1.4}>
          <Clapper />
        </group>
      </Hoverable>
      <Hoverable {...common("flauta")} position={[-0.3, 1.95, -4.9]} hitbox={[1.8, 0.35, 0.3]} hitboxY={0.06} tooltipY={0.8}>
        <group scale={1.4}>
          <Flute />
        </group>
      </Hoverable>
      <Hoverable {...common("balon")} position={[1.65, 0, 2.0]} hitbox={[0.6, 0.6, 0.6]} tooltipY={1.3}>
        <Ball />
      </Hoverable>
      <Hoverable {...common("maletin")} position={[4.1, 0, -2.4]} rotation={[0, -0.6, 0]} hitbox={[0.8, 0.7, 0.3]} tooltipY={1.4}>
        <Briefcase />
      </Hoverable>
      <Hoverable {...common("diccionario")} position={[-4.78, 1.215, 1.95]} hitbox={[0.35, 0.5, 0.3]} tooltipY={1.2}>
        <Dictionary />
      </Hoverable>
      <Hoverable {...common("coche")} position={[-1.1, 0, 2.7]} rotation={[0, 0.6, 0]} hitbox={[0.75, 0.45, 0.45]} tooltipY={1.2}>
        <ToyCar />
      </Hoverable>
      <Hoverable {...common("ordenador")} position={[2.5, 1.05, -4.6]} hitbox={[1.3, 1.05, 0.5]} tooltipY={1.6}>
        <Monitor />
      </Hoverable>
      <Hoverable {...common("apuntes")} position={[1.55, 1.05, -4.2]} hitbox={[0.75, 0.12, 1.2]} tooltipY={1.0}>
        <Notes />
      </Hoverable>
      <Hoverable {...common("silla")} position={[2.5, 0, -3.1]} hitbox={[0.75, 1.4, 0.75]} tooltipY={1.9} lift={false}>
        <Chair />
      </Hoverable>
    </group>
  );
}
