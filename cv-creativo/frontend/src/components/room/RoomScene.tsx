import { useEffect, useMemo, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Color, type AmbientLight, type DirectionalLight, type PointLight } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { RoomObject, Waypoint } from "@/lib/room";
import { NightContext, useNight, type NightState } from "./primitives";
import Furniture from "./Furniture";
import NeonSign from "./NeonSign";
import Character from "./Character";
import Items from "./Items";

export const CAMERA_HOME: [number, number, number] = [12, 10, 12];
export const TARGET_HOME: [number, number, number] = [0, 1, 0];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function Lights() {
  const night = useNight();
  const amb = useRef<AmbientLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const moon = useRef<DirectionalLight>(null);
  const neon = useRef<PointLight>(null);
  const lamp = useRef<PointLight>(null);
  const bg = useRef<Color>(null);
  const c = useMemo(
    () => ({
      ambDay: new Color("#FFF7ED"),
      ambNight: new Color("#6D6A9C"),
      bgDay: new Color("#F6E3D0"),
      bgNight: new Color("#0B1020"),
    }),
    [],
  );

  useFrame((s, dt) => {
    const st = night.current;
    st.value += (st.target - st.value) * Math.min(1, dt * 1.5);
    const n = st.value;
    const flicker = 0.92 + Math.sin(s.clock.elapsedTime * 9) * 0.04 + Math.sin(s.clock.elapsedTime * 23) * 0.04;
    if (amb.current) {
      amb.current.intensity = lerp(1.1, 0.45, n);
      amb.current.color.copy(c.ambDay).lerp(c.ambNight, n);
    }
    if (sun.current) sun.current.intensity = lerp(2.2, 0, n);
    if (moon.current) moon.current.intensity = lerp(0, 0.55, n);
    if (neon.current) neon.current.intensity = lerp(0.8, 7, n) * flicker;
    if (lamp.current) lamp.current.intensity = lerp(0.4, 5, n);
    bg.current?.copy(c.bgDay).lerp(c.bgNight, n);
  });

  return (
    <>
      <color ref={bg} attach="background" args={["#F6E3D0"]} />
      <ambientLight ref={amb} intensity={1.1} />
      <directionalLight
        ref={sun}
        position={[8, 14, 6]}
        intensity={2.2}
        color="#FFE8B0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0005}
      />
      <directionalLight ref={moon} position={[-2, 10, 9]} intensity={0} color="#A5B4FC" />
      <pointLight ref={neon} position={[-0.3, 3.1, -4.2]} color="#FF2A6D" intensity={0.8} distance={10} decay={1} />
      <pointLight ref={lamp} position={[3.6, 1.6, -4.1]} color="#7DD3FC" intensity={0.4} distance={6} decay={1} />
    </>
  );
}

interface RoomSceneProps {
  nightTarget: number;
  station: Waypoint;
  hovered: string | null;
  setHovered: Dispatch<SetStateAction<string | null>>;
  objects: RoomObject[] | undefined;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}

function SceneContent({ nightTarget, station, hovered, setHovered, objects, controlsRef }: RoomSceneProps) {
  const night = useRef<NightState>({ value: nightTarget, target: nightTarget });
  useEffect(() => {
    night.current.target = nightTarget;
  }, [nightTarget]);

  return (
    <NightContext.Provider value={night}>
      <Lights />
      <Furniture />
      <NeonSign />
      <Character station={station} />
      <Items hovered={hovered} setHovered={setHovered} objects={objects} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={TARGET_HOME}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={1.45}
        minAzimuthAngle={-0.2}
        maxAzimuthAngle={Math.PI / 2 + 0.2}
        minDistance={6}
        maxDistance={28}
      />
    </NightContext.Provider>
  );
}

export default function RoomScene(props: RoomSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: CAMERA_HOME, fov: 38, near: 0.1, far: 200 }}
      onPointerMissed={() => props.setHovered(null)}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
