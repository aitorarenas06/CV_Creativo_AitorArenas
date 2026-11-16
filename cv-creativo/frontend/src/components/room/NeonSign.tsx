import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial } from "three";
import { useNight } from "./primitives";

const TEXT = "CV creativo";

function draw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 150px "Outfit Variable", "Outfit", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = canvas.width / 2;
  const y = canvas.height / 2 + 6;
  ctx.lineJoin = "round";
  // outer glow passes
  for (const [blur, width, color] of [
    [60, 14, "rgba(255,42,109,0.9)"],
    [30, 10, "rgba(255,42,109,1)"],
    [12, 7, "rgba(255,120,170,1)"],
  ] as const) {
    ctx.shadowColor = "#FF2A6D";
    ctx.shadowBlur = blur;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeText(TEXT, x, y);
  }
  // hot white core of the tube
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#FFD1E1";
  ctx.strokeStyle = "#FFF1F6";
  ctx.lineWidth = 3;
  ctx.strokeText(TEXT, x, y);
}

export default function NeonSign() {
  const night = useNight();
  const mat = useRef<MeshBasicMaterial>(null);
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    draw(c);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return { canvas: c, texture: t };
  }, []);

  useEffect(() => {
    // redraw once the web font is ready so the sign uses Outfit
    document.fonts.load('600 150px "Outfit Variable"').then(() => {
      draw(canvas);
      texture.needsUpdate = true;
    });
    return () => texture.dispose();
  }, [canvas, texture]);

  useFrame((s) => {
    if (!mat.current) return;
    const n = night.current.value;
    const t = s.clock.elapsedTime;
    // subtle flicker that only shows at night
    const flicker = Math.sin(t * 37) > 0.97 || (t % 7 > 6.8 && t % 7 < 6.88) ? 0.55 : 1;
    const k = (0.75 + n * 0.9) * (1 - n * (1 - flicker));
    mat.current.color.setScalar(k);
  });

  return (
    <group position={[-0.3, 3.15, -4.97]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.7, 1.05, 0.05]} />
        <meshStandardMaterial color="#1E1B2E" transparent opacity={0.55} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
